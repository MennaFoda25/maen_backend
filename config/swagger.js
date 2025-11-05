const CorrectionProgram = require('../models/correctionProgramModel');

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
      // url: 'http://localhost:3000/api/v1',
      url: 'https://maen-backend.onrender.com/api/v1',
      // description: 'local dev server',
      description:
        process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
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
      CorrectionProgram: {
        type: 'object',
        properties: {
          assignedTeacher: { $ref: '#/components/schemas/TeacherProfile' },
          goal: {
            type: 'String',
            example:
              'general_mistakes or hidden_mistakes or ijazah_preparation or performance_development',
          },
          currentLevel: { type: 'String', example: 'beginner or intermediate or advanced' },
          sessionsPerWeek: { type: 'Number', example: '1 , 2,3,4,5' },
          sessionDuration: { type: 'Number', example: '15,30,45,60' },
          preferredTimes: { type: 'array', example: '6-9_am' },
          Days: { type: 'array', example: 'sunday , monday' },
          planName: { type: 'String' },
          fromSurah: { type: 'String' },
          toSurah: { type: 'String' },
          audioReferences: { type: 'String' },
          pagesPerSession: { type: 'Number' },
          totalPages: { type: 'Number' },
          completedPages: { type: 'Number' },
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
    '/programs/correction': {
      post: {
        tags: ['Correction Program'],
        summary: 'Create a new correction program (student only) ',
        description: 'Creates a correction program and uploads quran audio refernces',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  assignedTeacher: { type: 'string', example: '68fdeb64c53906d3a283b8bf' },
                  goal: {
                    type: 'string',
                    example: 'general_mistakes',
                    enum: [
                      'general_mistakes',
                      'hidden_mistakes',
                      'ijazah_preparation',
                      'performance_development',
                    ],
                  },
                  currentLevel: {
                    type: 'string',
                    enum: ['beginner', 'intermediate', 'advanced'],
                    example: 'intermediate',
                  },
                  sessionsPerWeek: { type: 'number', example: 3 },
                  sessionDuration: { type: 'number', example: 30 },
                  preferredTimes: {
                    type: 'string',
                    example: '6-9_am,10-1_pm',
                    description: 'Comma-separated or array of time slots',
                  },
                  preferredDays: {
                    type: 'string',
                    example: 'sunday,tuesday,thursday',
                    description: 'Comma-separated or array of days',
                  },
                  planName: { type: 'string', example: 'General Correction Plan' },
                  fromSurah: { type: 'string', example: 'Al-Fatihah' },
                  toSurah: { type: 'string', example: 'Al-Baqarah' },
                  audioReferences: {
                    type: 'string',
                    format: 'binary',
                    description: 'Upload audio file',
                  },
                  pagesPerSession: { type: 'number', example: 1 },
                  totalPages: { type: 'number', example: 10 },
                  trialSession: { type: 'boolean', example: true },
                },
                required: ['goal', 'planName', 'fromSurah', 'toSurah'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Correction program created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: {
                      type: 'string',
                      example: 'Correction program is created successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        program: { $ref: '#/components/schemas/CorrectionProgram' },
                        trialSession: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string', example: '690a6dd1652bdea9c1ca005e' },
                            program: { type: 'string', example: '690a6dd1652bdea9c1ca005b' },
                            student: { $ref: '#/components/schemas/UserShort' },
                            teacher: { $ref: '#/components/schemas/UserShort' },
                            duration: { type: 'number', example: 15 },
                            status: {
                              type: 'string',
                              enum: ['pending', 'scheduled', 'completed', 'cancelled'],
                              example: 'pending',
                            },
                            preferredDays: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['sunday', 'tuesday', 'thursday'],
                            },
                            preferredTimes: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['6-9_am', '10-1_pm'],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation or upload error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Not allowed (only active students can create)',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },

      get: {
        tags: ['Correction Program'],
        summary: 'Get my correction programs (student only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of student’s correction programs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'number', example: 2 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CorrectionProgram' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/programs/correction/all': {
      get: {
        tags: ['Correction Program (Admin)'],
        summary: 'Get all correction programs (admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'All correction programs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CorrectionProgram' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/programs/correction/trials': {
      get: {
        tags: ['Correction Program (Admin)'],
        summary: 'Get all trial sessions (admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of all free trial sessions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'number', example: 5 },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          student: { $ref: '#/components/schemas/UserShort' },
                          teacher: { $ref: '#/components/schemas/UserShort' },
                          preferredDays: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['sunday', 'tuesday'],
                          },
                          preferredTimes: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['6-9_am'],
                          },
                          status: { type: 'string', example: 'pending' },
                          duration: { type: 'number', example: 15 },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/teachers/Mytrials': {
      get: {
        tags: ['Teacher'],
        summary: 'Get all trial sessions assigned to the logged-in teahcer',
        description: 'Return all trial sessions assigned to the teacher',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of trial sessions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number', example: 2 },
                    data: {
                      type: 'object',
                      properties: {
                        trialSession: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              _id: { type: 'string', example: '6909e77649e8c85f507c4689' },
                              program: {
                                type: 'object',
                                properties: {
                                  _id: { type: 'string', example: '6909e77649e8c85f507c4686' },
                                  planName: { type: 'string', example: 'General Correction Plan' },
                                  goal: { type: 'string', example: 'general_mistakes' },
                                  currentLevel: { type: 'string', example: 'intermediate' },
                                  status: { type: 'string', example: 'active' },
                                },
                              },
                              student: {
                                type: 'object',
                                properties: {
                                  _id: { type: 'string', example: '690900a8c0461452da6539a7' },
                                  name: { type: 'string', example: 'menna' },
                                  email: { type: 'string', example: 'studenttest@gmail.com' },
                                },
                              },
                              teacher: {
                                type: 'object',
                                properties: {
                                  _id: { type: 'string', example: '68fe72e608a6a18c0ec78d56' },
                                  name: { type: 'string', example: 'ashraf' },
                                  email: { type: 'string', example: 'teacher@gmail.com' },
                                },
                              },
                              duration: { type: 'number', example: 15 },
                              status: { type: 'string', example: 'pending' },
                              scheduledAt: { type: 'string', format: 'date-time' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          403: {
            description: 'Forbidden - only teachers allowed',
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
    },
    '/teachers/{id}': {
      patch: {
        tags: ['Teacher'],
        summary: 'Teacher schedule the trial session',
        description: `
Allows a teacher to confirm and schedule a pending trial session.
The teacher must be the one assigned to this trial. Requires Firebase authentication.
`,
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Trial session ID to confirm and schedule',
            schema: { type: 'string', example: '690a3f18e09ab30fc38467f8' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  scheduledAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-11-06T18:00:00Z',
                    description: 'Date and time for the scheduled session (UTC)',
                  },
                  meetingLink: {
                    type: 'string',
                    example: 'https://meet.google.com/abc-defg-hij',
                    description: 'Meeting link for the session (e.g. Zoom, Google Meet)',
                  },
                },
                required: ['scheduledAt', 'meetingLink'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Trial session scheduled successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Trial session scheduled successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', example: '690a3f18e09ab30fc38467f8' },
                        program: { type: 'string', example: '690a62ad08738634f3f0c389' },
                        student: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', example: 'menna' },
                            email: { type: 'string', example: 'student@gmail.com' },
                          },
                        },
                        teacher: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', example: 'ashraf' },
                            email: { type: 'string', example: 'teacher@gmail.com' },
                          },
                        },
                        scheduledAt: { type: 'string', format: 'date-time' },
                        meetingLink: {
                          type: 'string',
                          example: 'https://meet.google.com/abc-defg-hij',
                        },
                        status: { type: 'string', example: 'scheduled' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid or missing input',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden — only assigned teacher can confirm the session',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Trial session not found',
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
