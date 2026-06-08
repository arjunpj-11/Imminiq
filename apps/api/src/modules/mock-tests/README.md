# Mock Tests Backend Module

Copy `apps/api/src/modules/mock-tests` into your API app and copy the model files into `apps/api/src/infrastructure/database/models`.

Register the routes in `app.ts`:

```ts
import { mockTestsRouter } from './modules/mock-tests'
app.use('/api/mock-tests', mockTestsRouter)
```

This module follows the strict clean architecture rules: domain contracts are pure, use cases own business logic, infrastructure owns Mongoose, and presentation owns HTTP/Zod.
