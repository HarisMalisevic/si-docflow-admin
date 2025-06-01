import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SI DocFlow API',
            version: '1.0.0',
        },
    },
    apis: [
        './src/modules/**/*.routes.ts',
        './src/modules/**/*.controller.ts',
        './src/router.ts',
        './src/auth/*.ts'
    ],
};

export const swaggerSpec = swaggerJSDoc(options);
export const swaggerUiMiddleware = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec);