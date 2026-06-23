import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const SPRING = {damping: 20, stiffness: 250, mass: 0.5};

export interface SortableListRenderItemParams<T> {
    item: T;
    index: number;
    dataIndex: number;
    isActive: boolean;
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
    children: React.ReactNode;
    itemIndex: number;
    activeIndexSV: ReturnType<typeof useSharedValue<number>>;
    dragOffsetSV: ReturnType<typeof useSharedValue<number>>;
    naturalOffsetSV: ReturnType<typeof useSharedValue<number>>;
    onLayout: (index: number, height: number) => void;
    onDragStart: (index: number, absoluteY: number) => void;
    onDragMove: (absoluteY: number) => void;
    onDragEnd: () => void;
    gap: number;
}

function SortableItem({
    children,
    itemIndex,
    activeIndexSV,
    dragOffsetSV,
    naturalOffsetSV,
    onLayout,
    onDragStart,
    onDragMove,
    onDragEnd,
    gap,
}: SortableItemProps) {
    const animStyle = useAnimatedStyle(() => {
        const isActive = activeIndexSV.value === itemIndex;
        return {
            transform: [{translateY: isActive ? dragOffsetSV.value + naturalOffsetSV.value : 0}],
            zIndex: isActive ? 100 : 1,
            shadowOpacity: isActive ? 0.2 : 0,
            shadowRadius: isActive ? 12 : 0,
            shadowOffset: {width: 0, height: isActive ? 6 : 0},
            shadowColor: '#000',
            elevation: isActive ? 8 : 0,
        };
    });

    const pan = Gesture.Pan()
        .activateAfterLongPress(250)
        .onStart((e) => {
            runOnJS(onDragStart)(itemIndex, e.absoluteY);
        })
        .onUpdate((e) => {
            dragOffsetSV.value = e.translationY;
            runOnJS(onDragMove)(e.absoluteY);
        })
        .onEnd(() => {
            dragOffsetSV.value = withSpring(0, SPRING);
            naturalOffsetSV.value = withSpring(0, SPRING);
            activeIndexSV.value = -1;
            runOnJS(onDragEnd)();
        })
        .onFinalize((_, success) => {
            if (!success && activeIndexSV.value !== -1) {
                dragOffsetSV.value = withSpring(0, SPRING);
                naturalOffsetSV.value = withSpring(0, SPRING);
                activeIndexSV.value = -1;
                runOnJS(onDragEnd)();
            }
        });

    return (
        <GestureDetector gesture={pan}>
            <Animated.View
                style={[animStyle, {marginBottom: gap}]}
                onLayout={(e) => onLayout(itemIndex, e.nativeEvent.layout.height)}
            >
                {children}
            </Animated.View>
        </GestureDetector>
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
    // displayOrder[i] = index into `data` shown at position i
    const [displayOrder, setDisplayOrder] = useState(() => data.map((_, i) => i));
    const displayOrderRef = useRef(displayOrder);
    displayOrderRef.current = displayOrder;

    // Mirrors activeIndexSV but lives in React state so renderItem can read it safely
    const [activeDataIndex, setActiveDataIndex] = useState(-1);

    const heights = useRef<number[]>(new Array(data.length).fill(60));
    const containerPageY = useRef(0);
    const activeOrderIndex = useRef(-1);
    const fingerOffsetInItem = useRef(0);

    const activeIndexSV = useSharedValue(-1);
    const dragOffsetSV = useSharedValue(0);
    const naturalOffsetSV = useSharedValue(0);

    const dataKey = data.map(keyExtractor).join(',');
    useEffect(() => {
        setDisplayOrder(data.map((_, i) => i));
        heights.current = new Array(data.length).fill(60);
    }, [dataKey]);

    const containerRef = useRef<View>(null);

    const getYForOrderIndex = useCallback((orderIdx: number) => {
        const order = displayOrderRef.current;
        let y = 0;
        for (let i = 0; i < orderIdx; i++) {
            y += (heights.current[order[i]] ?? 60) + gap;
        }
        return y;
    }, [gap]);

    const getOrderIndexFromRelativeY = useCallback((relativeY: number) => {
        const order = displayOrderRef.current;
        let cumY = 0;
        for (let i = 0; i < order.length; i++) {
            const h = heights.current[order[i]] ?? 60;
            if (relativeY < cumY + h / 2) return i;
            cumY += h + gap;
        }
        return order.length - 1;
    }, [gap]);

    const handleLayout = useCallback((index: number, height: number) => {
        heights.current[index] = height;
    }, []);

    const handleDragStart = useCallback((dataIndex: number, absoluteY: number) => {
        containerRef.current?.measure((_x, _y, _w, _h, _pageX, pageY) => {
            containerPageY.current = pageY;
        });
        const orderIdx = displayOrderRef.current.indexOf(dataIndex);
        activeOrderIndex.current = orderIdx;
        activeIndexSV.value = dataIndex;
        naturalOffsetSV.value = 0;
        dragOffsetSV.value = 0;
        fingerOffsetInItem.current = absoluteY - (containerPageY.current + getYForOrderIndex(orderIdx));
        setActiveDataIndex(dataIndex);
        onDragStateChange?.(true);
    }, [getYForOrderIndex, onDragStateChange]);

    const handleDragMove = useCallback((absoluteY: number) => {
        if (activeOrderIndex.current < 0) return;
        const relativeY = absoluteY - containerPageY.current - fingerOffsetInItem.current;
        const targetOrderIdx = getOrderIndexFromRelativeY(relativeY);
        if (targetOrderIdx === activeOrderIndex.current) return;

        const prevNaturalY = getYForOrderIndex(activeOrderIndex.current);
        const newOrder = [...displayOrderRef.current];
        const [item] = newOrder.splice(activeOrderIndex.current, 1);
        newOrder.splice(targetOrderIdx, 0, item);
        activeOrderIndex.current = targetOrderIdx;
        displayOrderRef.current = newOrder;
        const newNaturalY = getYForOrderIndex(targetOrderIdx);
        naturalOffsetSV.value -= (newNaturalY - prevNaturalY);
        setDisplayOrder(newOrder);
    }, [getYForOrderIndex, getOrderIndexFromRelativeY]);

    const handleDragEnd = useCallback(() => {
        if (activeOrderIndex.current < 0) return;
        const reordered = displayOrderRef.current.map(i => data[i]);
        // Reset displayOrder to sequential in the same batch as onReorder so the parent's
        // data update and our displayOrder are always in sync (avoids a one-frame glitch
        // where the old displayOrder is applied to the newly-reordered data array).
        setDisplayOrder(reordered.map((_, i) => i));
        heights.current = new Array(reordered.length).fill(60);
        activeOrderIndex.current = -1;
        setActiveDataIndex(-1);
        onDragStateChange?.(false);
        onReorder(reordered);
    }, [data, onReorder, onDragStateChange]);

    return (
        <View ref={containerRef}>
            {displayOrder.filter(dataIdx => dataIdx < data.length).map((dataIdx, orderIdx) => (
                <SortableItem
                    key={keyExtractor(data[dataIdx])}
                    itemIndex={dataIdx}
                    activeIndexSV={activeIndexSV}
                    dragOffsetSV={dragOffsetSV}
                    naturalOffsetSV={naturalOffsetSV}
                    onLayout={handleLayout}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    gap={gap}
                >
                    {renderItem({
                        item: data[dataIdx],
                        index: orderIdx,
                        dataIndex: dataIdx,
                        isActive: activeDataIndex === dataIdx,
                    })}
                </SortableItem>
            ))}
        </View>
    );
}
