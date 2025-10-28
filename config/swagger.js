// const swaggerJSDocs = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');

// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Moeen API',
//       version: '1.0.0',
//       description: 'Backend API Documentationfor Moeen',
//     },
//     servers: [
//       {
//         url: 'http://localhost:3000/api/v1',
//       },
//     ],
//   },
//   apis: ['./routes/*.js'],
// };

// const swaggerSpec = swaggerJSDocs(options);

// function swaggerDocs(app) {
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//   console.log('📌 Swagger Docs available at: http://localhost:3000/api-docs');
// }

// module.exports = swaggerDocs;
// config/swaggerDocument.js
module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Quraan Tutor API',
    version: '1.0.0',
    description:
      'API docs for Quraan Tutor backend. NOTE: Authentication uses Firebase ID tokens — get an idToken from Firebase and paste it into the Authorize dialog as `Bearer <idToken>`.',
  },
  servers: [
    {
    url: "https://maen-backend.onrender.com/api/v1",
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT (Firebase ID token)',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'fail' },
          message: { type: 'string', example: 'Error description' },
        },
      },
      StudentProfile: {
        type: 'object',
        properties: {
          learning_goals: {
            type: 'array',
            items: { type: 'string' },
            example: ['Hifz'],
          },
          current_level: { type: 'string', example: 'beginner' },
        },
      },
      TeacherProfile: {
        type: 'object',
        properties: {
          bio: { type: 'string', example: 'Experienced' },
          certificates: {
            type: 'array',
            items: { type: 'string' },
            example: ['Ijaza'],
          },
          specialties: {
            type: 'array',
            items: { type: 'string' },
            example: ['Tajweed'],
          },
          hourly_rate: { type: 'number', example: 15 },
        },
      },
      UserShort: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64...' },
          name: { type: 'string', example: 'student' },
          email: { type: 'string', example: 'student@gmail.com' },
          role: { type: 'string', example: 'student' },
          status: { type: 'string', example: 'active' },
          //  studentProfile: { $ref: '#/components/schemas/StudentProfile' },
        },
      },
      TeacherRequest: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '68fe7164...' },
          email: { type: 'string', example: 'teacher@gmail.com' },
          name: { type: 'string', example: 'menna' },
          firebaseUid: { type: 'string', example: 'sN3u02...' },
          teacherProfile: { $ref: '#/components/schemas/TeacherProfile' },
          status: { type: 'string', example: 'pending' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterStudentResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Account created successfully' },
          user: { $ref: '#/components/schemas/UserShort' },
        },
      },
      RegisterTeacherResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Teacher request created and pending admin approval',
          },
          request: { $ref: '#/components/schemas/TeacherRequest' },
        },
      },
      ApproveResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Teacher request approved' },
          teacherReq: { $ref: '#/components/schemas/TeacherRequest' },
          user: { $ref: '#/components/schemas/UserShort' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary:
          'Register a new account (student or teacher). Use multipart/form-data for image + JSON fields.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  passwordConfirm: { type: 'string' },
                  role: { type: 'string', enum: ['student', 'teacher'], example: 'student' },
                  studentProfile: {
                    type: 'string',
                    description: 'Only if role = student (JSON string)',
                    example: '{"learning_goals":["Hifz"],"current_level":"beginner"}',
                  },
                  teacherProfile: {
                    type: 'string',
                    description: 'Only if role = teacher (JSON string)',
                    example: ' {"bio":"...","certificates":["..."],"specialties":["..."]}',
                  },
                  profileImg: { type: 'string', format: 'binary' },
                },
                required: ['email', 'name', 'password', 'passwordConfirm', 'role'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Student created OR Teacher request created',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/RegisterStudentResponse' },
                    { $ref: '#/components/schemas/RegisterTeacherResponse' },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user (requires Authorization: Bearer <Firebase idToken>)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user data (Mongo user)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/UserShort' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    '/teacherRequest': {
      post: {
        tags: ['TeacherRequest'],
        summary:
          'Create a teacher request (student upgrade OR teacher first-login). Requires Firebase token.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  // For student upgrade: send teacherProfile
                  teacherProfile: { $ref: '#/components/schemas/TeacherProfile' },
                },
                required: ['teacherProfile'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Teacher request created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterTeacherResponse' },
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      get: {
        tags: ['TeacherRequest'],
        summary:
          'List teacher requests (admin only). Supports optional query param ?status=pending|approved|rejected',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
          },
        ],
        responses: {
          200: {
            description: 'Array of teacher requests',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    requests: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TeacherRequest' },
                    },
                  },
                },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    '/teacherRequest/{id}': {
      patch: {
        tags: ['TeacherRequest'],
        summary:
          "Admin approve or reject a teacher request. Body: { status: 'approved' | 'rejected' }",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['approved', 'rejected'] },
                  reason: { type: 'string', description: 'optional rejection reason' },
                },
                required: ['status'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Request reviewed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApproveResponse' },
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Admin'],
        summary: 'Get all users (admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of all users',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    results: { type: 'number' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/UserShort' },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Forbidden (admin only)',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    '/users/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Get a user by ID (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'User data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserShort' },
              },
            },
          },
        },
      },
    //   patch: {
    //     tags: ['Admin'],
    //     summary: 'Update user data (admin only)',
    //     security: [{ bearerAuth: [] }],
    //     parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         'application/json': {
    //           schema: {
    //             type: 'object',
    //             properties: {
    //               name: { type: 'string' },
    //               email: { type: 'string' },
    //               role: { type: 'string', enum: ['student', 'teacher', 'admin'] },
    //             },
    //           },
    //         },
    //       },
    //     },
    //     responses: {
    //       200: {
    //         description: 'User updated successfully',
    //         content: {
    //           'application/json': {
    //             schema: { $ref: '#/components/schemas/UserShort' },
    //           },
    //         },
    //       },
    //       401: {
    //         description: 'Unauthorized',
    //         content: {
    //           'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
    //         },
    //       },
    //       403: {
    //         description: 'Forbidden (admin only)',
    //         content: {
    //           'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
    //         },
    //       },
    //       404: {
    //         description: 'User not found',
    //         content: {
    //           'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
    //         },
    //       },
    //     },
    //   },
      delete: {
        tags: ['Admin'],
        summary: 'Delete a user (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          204: {
            description: 'User deleted successfully',
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Forbidden (admin only)',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    '/users/changePassword': {
      put: {
        summary: "Change logged-in user's password (Firebase only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { newPassword: { type: 'string', example: '12345678' } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password changed successfully',
          },
        },
      },
    },
    '/users/{id}/suspend': {
      put: {
        tags: ['Admin'],
        summary: "Suspend or activate a user (admin only). Body: { action: 'suspend'|'activate' }",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { status: { type: 'string', enum: ['inactive', 'active'] } },
                required: ['status'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User status updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/UserShort' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid action or bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (admin only)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};
