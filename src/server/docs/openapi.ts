export function getOpenApiDocument() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const crudPaths = (
    path: string,
    tag: string,
    label: string,
    schema: string,
    inputSchema: string,
  ) => ({
    [path]: {
      get: {
        tags: [tag],
        summary: `List ${label.toLowerCase()} records`,
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: `${label} list` } },
      },
      post: {
        tags: [tag],
        summary: `Create ${label.toLowerCase()} record`,
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${inputSchema}` },
            },
          },
        },
        responses: { "201": { description: `${label} created` } },
      },
    },
    [`${path}/{id}`]: {
      get: {
        tags: [tag],
        summary: `Get ${label.toLowerCase()} by id`,
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: `${label} found`,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${schema}` },
              },
            },
          },
          "404": { description: "Not found" },
        },
      },
      put: {
        tags: [tag],
        summary: `Update ${label.toLowerCase()}`,
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${inputSchema}` },
            },
          },
        },
        responses: {
          "200": { description: `${label} updated` },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: [tag],
        summary: `Delete ${label.toLowerCase()}`,
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: `${label} deleted` },
          "404": { description: "Not found" },
          "409": { description: "Record is still referenced" },
        },
      },
    },
  });

  return {
    openapi: "3.0.3",
    info: {
      title: "EviMersin Admin API",
      version: "1.0.0",
      description:
        "Authentication and admin management API for the EviMersin dashboard. Use `/api/admin/auth/login` to get access + refresh tokens.",
    },
    servers: [{ url: appUrl }],
    tags: [
      { name: "Auth", description: "Login, refresh, logout, and profile" },
      { name: "Admin", description: "Admin CRUD endpoints" },
      { name: "Countries", description: "Country management" },
      { name: "Cities", description: "City management" },
      { name: "Categories", description: "Property category management" },
      { name: "Purposes", description: "Property purpose management" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: { type: "object", nullable: true },
          },
        },
        AdminPublic: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            username: { type: "string", example: "admin" },
            name: { type: "string", example: "Super Admin" },
            status: { type: "integer", enum: [0, 1], example: 1 },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
            tokenType: { type: "string", example: "Bearer" },
            expiresIn: { type: "string", example: "15m" },
            admin: { $ref: "#/components/schemas/AdminPublic" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string", example: "admin" },
            password: { type: "string", example: "Admin123!" },
          },
        },
        RefreshRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
        CreateAdminRequest: {
          type: "object",
          required: ["username", "password", "name"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            name: { type: "string" },
            status: { type: "integer", enum: [0, 1], default: 1 },
          },
        },
        UpdateAdminRequest: {
          type: "object",
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            name: { type: "string" },
            status: { type: "integer", enum: [0, 1] },
          },
        },
        Country: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            status: { type: "integer", enum: [0, 1] },
          },
        },
        CountryInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            status: { type: "integer", enum: [0, 1], default: 1 },
          },
        },
        City: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            country_id: { type: "integer" },
            country_name: { type: "string" },
            status: { type: "integer", enum: [0, 1] },
          },
        },
        CityInput: {
          type: "object",
          required: ["name", "country_id"],
          properties: {
            name: { type: "string" },
            country_id: { type: "integer" },
            status: { type: "integer", enum: [0, 1], default: 1 },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            status: { type: "integer", enum: [0, 1] },
            position: { type: "integer" },
            icon: { type: "string", nullable: true },
          },
        },
        CategoryInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            status: { type: "integer", enum: [0, 1], default: 1 },
            position: { type: "integer", default: 0 },
            icon: { type: "string", nullable: true },
          },
        },
        Purpose: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            status: { type: "integer", enum: [0, 1] },
            position: { type: "integer" },
          },
        },
        PurposeInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            status: { type: "integer", enum: [0, 1], default: 1 },
            position: { type: "integer", default: 0 },
          },
        },
      },
    },
    paths: {
      "/api/admin/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Admin login",
          description: "Returns access token + refresh token.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiSuccess" },
                      {
                        type: "object",
                        properties: {
                          data: { $ref: "#/components/schemas/AuthTokens" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "401": {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiError" },
                },
              },
            },
          },
        },
      },
      "/api/admin/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          description: "Rotates refresh token and returns a new token pair.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RefreshRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Tokens refreshed",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiSuccess" },
                      {
                        type: "object",
                        properties: {
                          data: { $ref: "#/components/schemas/AuthTokens" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "401": {
              description: "Invalid refresh token",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiError" },
                },
              },
            },
          },
        },
      },
      "/api/admin/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout admin",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    refreshToken: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Logged out" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/admin/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current admin profile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Current admin",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiSuccess" },
                      {
                        type: "object",
                        properties: {
                          data: { $ref: "#/components/schemas/AdminPublic" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/admin": {
        get: {
          tags: ["Admin"],
          summary: "List admins",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Admin list" },
            "401": { description: "Unauthorized" },
          },
        },
        post: {
          tags: ["Admin"],
          summary: "Create admin",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateAdminRequest" },
              },
            },
          },
          responses: {
            "201": { description: "Admin created" },
            "401": { description: "Unauthorized" },
            "409": { description: "Username exists" },
          },
        },
      },
      "/api/admin/{id}": {
        get: {
          tags: ["Admin"],
          summary: "Get admin by id",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Admin found" },
            "404": { description: "Not found" },
          },
        },
        put: {
          tags: ["Admin"],
          summary: "Update admin",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateAdminRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Admin updated" },
            "404": { description: "Not found" },
          },
        },
        delete: {
          tags: ["Admin"],
          summary: "Delete admin",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Admin deleted" },
            "404": { description: "Not found" },
          },
        },
      },
      ...crudPaths(
        "/api/admin/countries",
        "Countries",
        "Country",
        "Country",
        "CountryInput",
      ),
      ...crudPaths(
        "/api/admin/cities",
        "Cities",
        "City",
        "City",
        "CityInput",
      ),
      ...crudPaths(
        "/api/admin/categories",
        "Categories",
        "Category",
        "Category",
        "CategoryInput",
      ),
      ...crudPaths(
        "/api/admin/purposes",
        "Purposes",
        "Purpose",
        "Purpose",
        "PurposeInput",
      ),
    },
  };
}
