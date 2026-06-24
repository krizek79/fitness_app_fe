import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Gesture, type PanGesture} from 'react-native-gesture-handler';
import Animated, {
    makeMutable,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    type SharedValue,
} from 'react-native-reanimated';

const SPRING = {damping: 20, stiffness: 250, mass: 0.5};

export interface SortableListRenderItemParams<T> {
    item: T;
    index: number;
    dataIndex: number;
    isActive: boolean;
    dragHandleGesture: PanGesture;
}

interface SortableListProps<T> {
    data: T[];
    keyExtractor: (item: T) => string;
    renderItem: (params: SortableListRenderItemParams<T>) => React.ReactNode;
    onReorder: (newData: T[]) => void;
    onDragStateChange?: (isDragging: boolean) => void;
    gap?: number;
}

interface SortableItemProps {
    children: (pan: PanGesture) => React.ReactNode;
    itemIndex: number;
    activeIndexSV: SharedValue<number>;
    dragOffsetSV: SharedValue<number>;
    itemOffsetSV: SharedValue<number>;
    onLayout: (index: number, height: number) => void;
    onDragStart: (index: number) => void;
    onDragMove: (translationY: number) => void;
    onDragEnd: () => void;
    gap: number;
}

function SortableItem({
    children,
    itemIndex,
    activeIndexSV,
    dragOffsetSV,
    itemOffsetSV,
    onLayout,
    onDragStart,
    onDragMove,
    onDragEnd,
    gap,
}: SortableItemProps) {
    // Keep itemIndex in a shared value so the gesture closure (useMemo([]))
    // always reads the current data-index even after the parent reorders the
    // data array and the same component instance receives a new itemIndex prop.
    const itemIndexSV = useSharedValue(itemIndex);
    useEffect(() => {
        itemIndexSV.value = itemIndex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemIndex]);

    const animStyle = useAnimatedStyle(() => {
        const isActive = activeIndexSV.value === itemIndexSV.value;
        return {
            transform: [{translateY: isActive ? dragOffsetSV.value : itemOffsetSV.value}],
            zIndex: isActive ? 100 : 1,
            shadowOpacity: isActive ? 0.2 : 0,
            shadowRadius: isActive ? 12 : 0,
            shadowOffset: {width: 0, height: isActive ? 6 : 0},
            shadowColor: '#000',
            elevation: isActive ? 8 : 0,
        };
    });

    // Never recreated — stable identity prevents GestureDetector from
    // re-attaching mid-drag (which would fire onFinalize(success=false)
    // and end the gesture after one reorder step).
    // onDragStart/Move/End are stable ref-wrappers from SortableList.
    const pan = useMemo(
        () =>
            Gesture.Pan()
                .activateAfterLongPress(250)
                .onStart(() => {
                    runOnJS(onDragStart)(itemIndexSV.value);
                })
                .onUpdate((e) => {
                    dragOffsetSV.value = e.translationY;
                    runOnJS(onDragMove)(e.translationY);
                })
                .onEnd(() => {
                    runOnJS(onDragEnd)();
                })
                .onFinalize((_, success) => {
                    if (!success && activeIndexSV.value !== -1) {
                        runOnJS(onDragEnd)();
                    }
                }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [itemIndexSV],
    );

    return (
        <Animated.View
            style={[animStyle, {marginBottom: gap}]}
            onLayout={(e) => onLayout(itemIndex, e.nativeEvent.layout.height)}
        >
            {children(pan)}
        </Animated.View>
    );
}

export function SortableList<T>({
    data,
    keyExtractor,
    renderItem,
    onReorder,
    onDragStateChange,
    gap = 8,
}: SortableListProps<T>) {
    const [displayOrder, setDisplayOrder] = useState(() => data.map((_, i) => i));
    const displayOrderRef = useRef(displayOrder);
    displayOrderRef.current = displayOrder;

    const [activeDataIndex, setActiveDataIndex] = useState(-1);

    const heights = useRef<number[]>(new Array(data.length).fill(60));
    // Drag state — all refs, never triggers re-renders during drag
    const activeOrderIdxRef = useRef(-1); // display position of active item
    const activeDataIdxRef = useRef(-1);
    const currentTargetRef = useRef(-1); // current target display position

    // One shared value per data slot for non-active item Y displacement.
    // Created with makeMutable (not a hook) so we can grow the pool safely.
    const itemOffsetSVs = useRef<SharedValue<number>[]>([]);
    while (itemOffsetSVs.current.length < data.length) {
        itemOffsetSVs.current.push(makeMutable(0));
    }

    const activeIndexSV = useSharedValue(-1);
    const dragOffsetSV = useSharedValue(0);

    const dataKey = data.map(keyExtractor).join(',');
    useEffect(() => {
        setDisplayOrder(data.map((_, i) => i));
        heights.current = new Array(data.length).fill(60);
        itemOffsetSVs.current.forEach((sv) => {
            sv.value = 0;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataKey]);

    // Y position of the top edge of display slot `orderIdx` in the current layout.
    const getNaturalY = useCallback(
        (orderIdx: number) => {
            const order = displayOrderRef.current;
            let y = 0;
            for (let i = 0; i < orderIdx; i++) {
                y += (heights.current[order[i]] ?? 60) + gap;
            }
            return y;
        },
        [gap],
    );

    // Which display slot the active item's centre currently falls into.
    const getTargetSlot = useCallback(
        (translationY: number): number => {
            const order = displayOrderRef.current;
            const activeH = heights.current[activeDataIdxRef.current] ?? 60;
            const activeCenterY =
                getNaturalY(activeOrderIdxRef.current) + translationY + activeH / 2;

            let cumY = 0;
            for (let i = 0; i < order.length; i++) {
                const h = heights.current[order[i]] ?? 60;
                if (activeCenterY < cumY + h / 2) return i;
                cumY += h + gap;
            }
            return order.length - 1;
        },
        [gap, getNaturalY],
    );

    // Animate non-active items to make room for the dragged item at `targetSlot`.
    // Shift = ±(height of active item + gap).  Direction depends on whether items
    // are between the start position and the target position.
    const applyShifts = useCallback(
        (targetSlot: number) => {
            const order = displayOrderRef.current;
            const startSlot = activeOrderIdxRef.current;
            const activeDataIdx = activeDataIdxRef.current;
            const shift = (heights.current[activeDataIdx] ?? 60) + gap;

            for (let i = 0; i < order.length; i++) {
                const dataIdx = order[i];
                if (dataIdx === activeDataIdx) continue;

                let offset = 0;
                if (targetSlot > startSlot && i > startSlot && i <= targetSlot) {
                    offset = -shift; // items skipped over when moving down → shift up
                } else if (targetSlot < startSlot && i >= targetSlot && i < startSlot) {
                    offset = shift; // items skipped over when moving up → shift down
                }

                const sv = itemOffsetSVs.current[dataIdx];
                if (sv) sv.value = withSpring(offset, SPRING);
            }
        },
        [gap],
    );

    const handleDragStart = useCallback(
        (dataIndex: number) => {
            const orderIdx = displayOrderRef.current.indexOf(dataIndex);
            activeOrderIdxRef.current = orderIdx;
            activeDataIdxRef.current = dataIndex;
            currentTargetRef.current = orderIdx;
            activeIndexSV.value = dataIndex;
            dragOffsetSV.value = 0;
            setActiveDataIndex(dataIndex);
            onDragStateChange?.(true);
        },
        [onDragStateChange],
    );

    const handleDragMove = useCallback(
        (translationY: number) => {
            if (activeOrderIdxRef.current < 0) return;
            const target = getTargetSlot(translationY);
            if (target === currentTargetRef.current) return;
            currentTargetRef.current = target;
            applyShifts(target);
        },
        [getTargetSlot, applyShifts],
    );

    const handleDragEnd = useCallback(() => {
        const startSlot = activeOrderIdxRef.current;
        const targetSlot = currentTargetRef.current;
        if (startSlot < 0) return;

        // Build new display order
        const order = [...displayOrderRef.current];
        const [moved] = order.splice(startSlot, 1);
        order.splice(targetSlot, 0, moved);

        // Snap all SVs to rest — React re-render positions items via layout
        itemOffsetSVs.current.forEach((sv) => {
            sv.value = 0;
        });
        dragOffsetSV.value = 0;
        activeIndexSV.value = -1;

        activeOrderIdxRef.current = -1;
        activeDataIdxRef.current = -1;
        currentTargetRef.current = -1;
        setActiveDataIndex(-1);
        onDragStateChange?.(false);

        // Commit — triggers one re-render with the final order, no mid-drag re-renders
        displayOrderRef.current = order;
        setDisplayOrder(order);
        onReorder(order.map((i) => data[i]));
    }, [data, onReorder, onDragStateChange]);

    // Stable ref-wrappers — the gesture's useMemo([]) closure captures these once.
    // The refs always point to the latest handler, so worklet → runOnJS calls are
    // never stale even if the parent re-renders and produces new handler functions.
    const dragStartRef = useRef(handleDragStart);
    dragStartRef.current = handleDragStart;
    const dragMoveRef = useRef(handleDragMove);
    dragMoveRef.current = handleDragMove;
    const dragEndRef = useRef(handleDragEnd);
    dragEndRef.current = handleDragEnd;

    const stableDragStart = useCallback((idx: number) => dragStartRef.current(idx), []);
    const stableDragMove = useCallback((t: number) => dragMoveRef.current(t), []);
    const stableDragEnd = useCallback(() => dragEndRef.current(), []);

    return (
        <View>
            {displayOrder
                .filter((dataIdx) => dataIdx < data.length)
                .map((dataIdx, orderIdx) => (
                    <SortableItem
                        key={keyExtractor(data[dataIdx])}
                        itemIndex={dataIdx}
                        activeIndexSV={activeIndexSV}
                        dragOffsetSV={dragOffsetSV}
                        itemOffsetSV={itemOffsetSVs.current[dataIdx]}
                        onLayout={(idx, h) => {
                            heights.current[idx] = h;
                        }}
                        onDragStart={stableDragStart}
                        onDragMove={stableDragMove}
                        onDragEnd={stableDragEnd}
                        gap={gap}
                    >
                        {(pan) =>
                            renderItem({
                                item: data[dataIdx],
                                index: orderIdx,
                                dataIndex: dataIdx,
                                isActive: activeDataIndex === dataIdx,
                                dragHandleGesture: pan,
                            })
                        }
                    </SortableItem>
                ))}
        </View>
    );
}
