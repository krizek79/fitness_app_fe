module.exports = {
    fitnessApi: {
        input: {
            target: process.env.OPENAPI_URL || 'http://localhost:8080/v3/api-docs',
        },
        output: {
            mode: 'tags-split',
            target: 'src/api/generated/fitness.ts',
            schemas: 'src/api/generated/model',
            client: 'react-query',
            httpClient: 'axios',
            mock: false,
            override: {
                mutator: {
                    path: 'src/api/axios-instance.ts',
                    name: 'customInstance',
                },
                zod: true,
            },
        },
    },
};