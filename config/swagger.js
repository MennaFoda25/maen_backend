const CorrectionProgram = require('../models/correctionProgramModel');

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Quraan Tutor API',
    version: '1.0.0',
    description: 'API docs for Quraan Tutor backend..',
  },
  servers: [
    {
      //url: 'http://localhost:3000/api/v1',
      url: 'https://maen-backend.onrender.com/api/v1',
      //description: 'local dev server',
      description:
      process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      FirebaseUidAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-firebase-uid',
        description:
          'Enter your Firebase UID here. This header replaces Firebase tokens and is required for authenticated routes.',
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

  security: [{ FirebaseUidAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        security: [{ FirebaseUidAuth: [] }],
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
                  phone: { type: 'string', example: '+201000999000' },
                  gender: { type: 'string', enum: ['male', 'female'], example: 'female' },
                  role: { type: 'string', enum: ['student', 'teacher'], example: 'student' },
                  studentProfile: {
                    type: 'string',
                    description: 'Only if role = student (JSON string)',
                    example: '{"learning_goals":["Hifz"],"current_level":"beginner"}',
                  },
                  teacherProfile: {
                    type: 'string',
                    description: 'Only if role = teacher (JSON string)',
                    example: `{
                  "bio": "Certified Quran tutor with 8 years of experience teaching Tajweed and Qira’at online.",
                  "major": "Islamic Studies",
                  "hasIjazah": true,
                  "qiraat": ["hafs", "warsh"],
                  "teachingTracks": ["tajweed", "hifz", "kids"],
                  "languages": ["arabic", "english"],
                  "quietEnvironment": true,
                  "deviceType": "desktop",
                  "timezone": "GMT+3:00 Asia/Riyadh",
                  "availabilitySchedule": [
                    { "day": "sunday", "timeSlots": [{ "from": "09:00", "to": "12:00" }] }
                  ]
                }`,
                  },
                  profile_picture: {
                    type: 'string',
                    format: 'binary',
                    description: 'Optional profile picture upload',
                  },
                  certificates: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description:
                      'Optional certificate file uploads (PDF, JPG, PNG). Can also send certificate names as strings instead of files.',
                  },
                  birthDate: { type: 'string', format: 'date', example: '1995-06-10' },
                  nationality: { type: 'string', example: 'Egyptian' },
                  countryOfResidence: { type: 'string', example: 'Saudi Arabia' },
                  declarationAccuracy: { type: 'boolean', example: true },
                  acceptTerms: { type: 'boolean', example: true },
                  acceptPrivacy: { type: 'boolean', example: true },
                },
                required: ['email', 'name', 'password', 'role'],
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
        security: [{ FirebaseUidAuth: [] }],
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
        security: [{ FirebaseUidAuth: [] }],
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
        security: [{ FirebaseUidAuth: [] }],
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
        security: [{ FirebaseUidAuth: [] }],
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
        security: [{ FirebaseUidAuth: [] }],
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
      patch: {
        tags: ['User'],
        summary: 'Update logged-in user profile (student & teacher)',
        description: `
Allows the authenticated user to update their personal and profile information.
Password cannot be changed here (must use /changeMyPassword).
Supports updating:
- name, email, phone, slug, profile picture
- studentProfile (learning_goals, current_level)
- teacherProfile (bio, specialties, certificates, hourly_rate, availability_schedule)
    `,
        security: [{ FirebaseUidAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Updated Name' },
                  email: { type: 'string', example: 'updated@gmail.com' },
                  phone: { type: 'string', example: '+201100200300' },
                  slug: { type: 'string', example: 'updated-name' },
                  profile_picture: {
                    type: 'string',
                    format: 'binary',
                    description: 'Optional profile picture',
                  },

                  // Student fields
                  learning_goals: {
                    type: 'string',
                    example: 'Hifz,Tajweed',
                    description: 'Comma-separated or array',
                  },
                  current_level: {
                    type: 'string',
                    example: 'intermediate',
                  },

                  // Teacher fields
                  bio: { type: 'string', example: 'Experienced Quran tutor' },
                  specialties: {
                    type: 'string',
                    example: 'Tajweed,Grammar',
                    description: 'Comma-separated or array',
                  },
                  hourly_rate: { type: 'number', example: 20 },
                  availability_schedule: {
                    type: 'string',
                    example: 'sunday-10-12,monday-8-10',
                    description: 'Comma-separated or array',
                  },
                  certificates: {
                    type: 'string',
                    example: 'Ijazah,Certified Tajweed',
                    description: 'Comma-separated or array',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'User updated successfully' },
                    data: { $ref: '#/components/schemas/UserShort' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Password update attempt or validation error',
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
      post: {
        tags: ['Admin'],
        summary: 'Create an admin (requires Firebase token)',
        description: `
Creates a new admin user based on Firebase UID.
Only works if role="admin" is sent in the request body.
    `,
        security: [{ FirebaseUidAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['admin'], example: 'admin' },
                  name: { type: 'string', example: 'Admin User' },
                  email: { type: 'string', example: 'admin@gmail.com' },
                  phone: { type: 'string', example: '+20100000000' },
                },
                required: ['role', 'name', 'email'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Admin created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Admin create successfully' },
                    admin: { $ref: '#/components/schemas/UserShort' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Missing Firebase token',
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
        security: [{ FirebaseUidAuth: [] }],
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
        tags: ['User'],
        summary: "Change logged-in user's password (Firebase only)",
        security: [{ FirebaseUidAuth: [] }],
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
        security: [{ FirebaseUidAuth: [] }],
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
        summary: 'Create a new correction program (student only)',
        description: 'Creates a correction program and optionally schedules a trial session.',
        security: [{ FirebaseUidAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  planName: { type: 'string', example: 'General Correction Plan' },

                  goal: {
                    type: 'string',
                    enum: [
                      'general_mistakes',
                      'hidden_mistakes',
                      'ijazah_preparation',
                      'performance_development',
                    ],
                    example: 'general_mistakes',
                  },

                  currentLevel: {
                    type: 'string',
                    enum: ['beginner', 'intermediate', 'advanced'],
                    example: 'intermediate',
                  },

                  sessionsPerWeek: { type: 'number', example: 2 },
                  sessionDuration: { type: 'number', example: 30 },

                  preferredTimes: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['6-9_am', '10-1_pm'],
                  },
                  Days: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['sunday', 'tuesday'],
                  },

                  fromSurah: { type: 'string', example: 'Al-Fatihah' },
                  toSurah: { type: 'string', example: 'Al-Baqarah' },

                  pagesPerSession: { type: 'number', example: 1 },
                  totalPages: { type: 'number', example: 20 },

                  assignedTeacher: { type: 'string', example: '68fe72e608a6a18c0ec78d56' },
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
                        program: { type: 'object' },
                        trialSession: { type: 'object', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Correction Program'],
        summary: 'Get logged-in user correction programs (Student & Teacher)',
        description: `
Returns correction programs depending on the logged-in user's role.

- If **student** → returns programs where student = logged-in user  
- If **teacher** → returns programs where assignedTeacher = logged-in user  

Requires Firebase authentication.
    `,
        security: [{ FirebaseUidAuth: [] }],
        responses: {
          200: {
            description: 'List of correction programs for student or teacher',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number', example: 2 },
                    role: { type: 'string', example: 'student' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CorrectionProgram' },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User has no correction programs',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Only teachers and students can access their programs',
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

    '/programs/correction/all': {
      get: {
        tags: ['Correction Program (Admin)'],
        summary: 'Get all correction programs (admin only)',
        description: 'Admin endpoint to list all correction programs in the system.',
        security: [{ FirebaseUidAuth: [] }],
        responses: {
          200: {
            description: 'List of all correction programs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'number', example: 10 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CorrectionProgram' },
                    },
                  },
                },
              },
            },
          },
          403: {
            description: 'Forbidden - Admin only',
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
    '/programs/child': {
      post: {
        tags: ['Child Memorization Program'],
        summary: 'Create a child memorization (taleqeen) program',
        description: 'Used by parents to create Quran memorization plans for children aged 3–11.',
        security: [{ FirebaseUidAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  childName: { type: 'string', example: 'Omar Mohamed' },
                  gender: { type: 'string', enum: ['male', 'female'], example: 'male' },
                  age: { type: 'number', example: 7 },

                  hasStudiedBefore: { type: 'boolean', example: true },
                  memorizedParts: { type: 'string', example: 'Juz Amma, Al-Fatihah' },

                  readingLevel: {
                    type: 'string',
                    enum: ['no_reading', 'letter_spelling', 'fluent'],
                    example: 'letter_spelling',
                  },

                  mainGoal: {
                    type: 'string',
                    enum: ['start_from_zero', 'revision', 'tajweed_improvement'],
                    example: 'start_from_zero',
                  },

                  weeklySessions: { type: 'number', example: 3 },
                  sessionDuration: { type: 'number', example: 30 },
                  preferredTimes: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['morning', 'evening'],
                  },
                  days: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['sunday', 'wednesday'],
                  },

                  teacherGender: {
                    type: 'string',
                    enum: ['male', 'female'],
                    example: 'female',
                  },
                  timeSlots: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['9-11', '4-7'],
                  },

                  notes: {
                    type: 'string',
                    example: 'Child is shy and struggles with pronouncing letter ص',
                  },

                  planName: { type: 'string', example: 'Kids Taleqeen Plan' },

                  memorizationDirection: {
                    type: 'string',
                    enum: ['fatihah_to_nas', 'nas_to_fatihah'],
                    example: 'fatihah_to_nas',
                  },

                  memorizationRange: {
                    type: 'object',
                    properties: {
                      fromSurah: { type: 'string', example: 'Al-Fatihah' },
                      fromAyah: { type: 'number', example: 1 },
                      toSurah: { type: 'string', example: 'An-Nas' },
                      toAyah: { type: 'number', example: 6 },
                    },
                  },

                  pagesPerSession: { type: 'number', example: 0.25 },

                  assignedTeacher: { type: 'string', example: '68fe72e608a6a18c0ec78d56' },
                  trialSession: { type: 'boolean', example: true },
                },
                required: [
                  'childName',
                  'gender',
                  'age',
                  'mainGoal',
                  'weeklySessions',
                  'sessionDuration',
                  'days',
                  'teacherGender',
                ],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Child memorization program created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        program: { type: 'object' },
                        trialSession: { type: 'object', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Child Memorization Program'],
        summary: 'Get logged-in user child memorization programs (student or teacher)',
        description: `
Returns child memorization programs based on the logged user's role:

- **Student (Parent)** → programs where \`parent = logged-in user\`
- **Teacher** → programs where \`assignedTeacher = logged-in user\`

Requires Firebase authentication.
    `,
        security: [{ FirebaseUidAuth: [] }],
        responses: {
          200: {
            description: 'List of child memorization programs for the logged-in user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number', example: 2 },
                    role: { type: 'string', example: 'student' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ChildMemorizationProgram' },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'No child memorization programs found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Only teachers and students can access their child programs',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized - missing Firebase token',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    'programs/child/all': {
      get: {
        tags: ['Child Memorization Program (Admin)'],
        summary: 'Get all child memorization programs (admin only)',
        description: 'Returns all child memorization programs in the system. Admin only endpoint.',
        security: [{ FirebaseUidAuth: [] }],
        responses: {
          200: {
            description: 'All child memorization programs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'number', example: 5 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ChildMemorizationProgram' },
                    },
                  },
                },
              },
            },
          },
          403: {
            description: 'Forbidden - Only admins can view all child programs',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized - Missing or invalid token',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    '/programs/memorization': {
      post: {
        tags: ['Memorization Program'],
        summary: 'Create a memorization program (student only)',
        description:
          'Student creates a new memorization program with scheduling, teacher assignment, and optional free trial.',
        security: [{ FirebaseUidAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  planName: { type: 'string', example: 'Hifz Juz Amma Plan' },
                  programType: {
                    type: 'string',
                    enum: ['new_memorization', 'memorization_revision', 'revision_consolidation'],
                    example: 'new_memorization',
                  },
                  memorizationDirection: {
                    type: 'string',
                    enum: ['fatihah_to_nas', 'nas_to_fatihah'],
                    example: 'fatihah_to_nas',
                  },
                  memorizedParts: { type: 'number', example: 0 },

                  weeklySessions: { type: 'number', example: 3 },
                  sessionDuration: { type: 'number', example: 30 },

                  preferredTimes: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['6-9_am', '2-5_pm'],
                  },
                  days: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['sunday', 'tuesday', 'thursday'],
                  },

                  memorizationRange: {
                    type: 'object',
                    properties: {
                      fromSurah: { type: 'string', example: 'Al-Fatihah' },
                      fromAyah: { type: 'number', example: 1 },
                      toSurah: { type: 'string', example: 'An-Naba' },
                      toAyah: { type: 'number', example: 40 },
                    },
                  },

                  pagePerSession: { type: 'number', example: 1 },

                  revisionRange: {
                    type: 'object',
                    properties: {
                      fromSurah: { type: 'string', example: 'An-Nas' },
                      fromAyah: { type: 'number', example: 1 },
                      toSurah: { type: 'string', example: 'Al-Falaq' },
                      toAyah: { type: 'number', example: 5 },
                    },
                  },
                  revisionPagesPerSession: { type: 'number', example: 0.5 },
                  revisionType: {
                    type: 'string',
                    enum: ['daily', 'weekly', 'monthly'],
                    example: 'weekly',
                  },

                  assignedTeacher: { type: 'string', example: '68fe72e608a6a18c0ec78d56' },
                  trialSession: { type: 'boolean', example: true },
                },
                required: [
                  'planName',
                  'programType',
                  'memorizationDirection',
                  'weeklySessions',
                  'sessionDuration',
                  'preferredTimes',
                  'days',
                ],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Memorization program created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: {
                      type: 'string',
                      example: 'Memorization program created successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        program: { type: 'object' },
                        trialSession: { type: 'object', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      get: {
        tags: ['Memorization Program'],
        summary: 'Get memorization programs for the logged-in user (teacher or student)',
        description: `
Returns memorization programs based on the logged user's role:

- **Student** → programs where \`student = logged user\`
- **Teacher** → programs where \`teacher = logged user\`

Requires Firebase authentication.
    `,
        security: [{ FirebaseUidAuth: [] }],
        responses: {
          200: {
            description: 'List of memorization programs for logged-in user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number', example: 2 },
                    role: { type: 'string', example: 'teacher' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/MemorizationProgram' },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'No memorization programs found for this user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Only teachers and students can access their memorization programs',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - Missing Firebase token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/programs/memorization/all': {
      get: {
        tags: ['Memorization Program (Admin)'],
        summary: 'Get all memorization programs (admin only)',
        description: 'Admin endpoint that returns every memorization program in the system.',
        security: [{ FirebaseUidAuth: [] }],
        responses: {
          200: {
            description: 'All memorization programs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'number', example: 10 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/MemorizationProgram' },
                    },
                  },
                },
              },
            },
          },
          403: {
            description: 'Forbidden - Only admins may access this endpoint',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - Missing or invalid Firebase UID header',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    '/teachers/Mytrials': {
      get: {
        tags: ['Teachers'],
        summary: 'Get all trial sessions assigned to the logged-in teahcer',
        description: 'Return all trial sessions assigned to the teacher',
        security: [{ FirebaseUidAuth: [] }],
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
        tags: ['Teachers'],
        summary: 'Teacher schedule the trial session',
        description: `
Allows a teacher to confirm and schedule a pending trial session.
The teacher must be the one assigned to this trial. Requires Firebase authentication.
`,
        security: [{ FirebaseUidAuth: [] }],
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
      get: {
        tags: ['Teachers'],
        summary: 'Get full teacher details by ID',
        description: `
Fetches a single teacher's complete profile, including personal info
and teacherProfile fields (bio, specialties, programPreference, etc.).
Only accessible by admin users.
`,
        security: [{ FirebaseUidAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Teacher ID',
            example: '68fe72e608a6a18c0ec78d56',
          },
        ],
        responses: {
          200: {
            description: 'Teacher data retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', example: '68fe72e608a6a18c0ec78d56' },
                        name: { type: 'string', example: 'Aisha Ahmed' },
                        email: { type: 'string', example: 'teacher@gmail.com' },
                        role: { type: 'string', example: 'teacher' },
                        status: { type: 'string', example: 'active' },
                        phone: { type: 'string', example: '+201022334455' },
                        gender: { type: 'string', example: 'female' },
                        teacherProfile: {
                          type: 'object',
                          properties: {
                            bio: { type: 'string', example: 'Experienced Quran teacher' },
                            specialties: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['Tajweed', 'Hifz'],
                            },
                            programPreference: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['MemorizationProgram', 'CorrectionProgram'],
                            },
                            hourly_rate: { type: 'number', example: 15 },
                            availability_schedule: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['sunday 10-1 pm', 'monday 6-9 pm'],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Teacher not found',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
            403: {
              description: 'Forbidden — only admin can access this endpoint',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
    },
    '/sessions/book': {
      post: {
        tags: ['Sessions'],
        summary: 'Book a new session between student and teacher',
        description:
          'Creates a scheduled session for any program (Correction, Memorization, Kids). Checks for time overlap and returns meetingId.',
        security: [{ FirebaseUidAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  programId: { type: 'string', example: '6914fccda2a8b969c624472a' },
                  programType: {
                    type: 'string',
                    enum: ['CorrectionProgram', 'MemorizationProgram', 'ChildMemorizationProgram'],
                    example: 'CorrectionProgram',
                  },
                  teacherId: { type: 'string', example: '68fe72e608a6a18c0ec78d56' },
                  scheduledAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-11-20T16:00:00.000Z',
                  },
                  duration: {
                    type: 'number',
                    enum: [15, 30, 45, 60],
                    example: 30,
                  },
                },
                required: ['programId', 'programType', 'teacherId', 'scheduledAt'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Session booked successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Session booked successfully' },
                    meetingId: { type: 'string', example: 'a94f3bd112acd8e7' },
                    session: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', example: '6914bf12b1f58a0012cd7712' },
                        scheduledAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation or overlap error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/teachers/by-program': {
      get: {
        tags: ['Teachers'],
        summary: 'Get teachers specialized in a specific program',
        description:
          'Returns teachers who have selected this program in their programPreference array.',
        security: [{ FirebaseUidAuth: [] }],
        parameters: [
          {
            name: 'program',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              enum: ['CorrectionProgram', 'MemorizationProgram', 'ChildMemorizationProgram'],
            },
            example: 'MemorizationProgram',
          },
        ],
        responses: {
          200: {
            description: 'List of teachers specialized in this program',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number', example: 3 },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          name: { type: 'string' },
                          email: { type: 'string' },
                          rating: { type: 'number' },
                          ratingCount: { type: 'number' },
                          teacherProfile: {
                            type: 'object',
                            properties: {
                              programPreference: { type: 'array', items: { type: 'string' } },
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
      },
    },
    '/teachers/top': {
      get: {
        tags: ['Teachers'],
        summary: 'Get the top 5 highest-rated teachers',
        security: [{ FirebaseUidAuth: [] }],
        responses: {
          200: {
            description: 'Top rated teachers list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number', example: 5 },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          email: { type: 'string' },
                          rating: { type: 'number' },
                          ratingCount: { type: 'number' },
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
    '/teachers/brief': {
      get: {
        tags: ['Teachers'],
        summary: 'Get all active teachers',
        security: [{ FirebaseUidAuth: [] }],
        responses: {
          200: {
            description: 'Full teacher list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number', example: 10 },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          email: { type: 'string' },
                          role: { type: 'string', example: 'teacher' },
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
    '/teachers/all': {
      get: {
        tags: ['Teachers'],
        summary: 'Get all active teachers',
        description: 'Returns a list of teachers whose status is active.',
        security: [{ FirebaseUidAuth: [] }],
        responses: {
          200: {
            description: 'List of active teachers',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number', example: 5 },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', example: '68fe72e608a6a18c0ec78d56' },
                          name: { type: 'string', example: 'Ahmed Ali' },
                          email: { type: 'string', example: 'teacher@gmail.com' },
                          phone: { type: 'string', example: '+201001112223' },
                          role: { type: 'string', example: 'teacher' },
                          status: { type: 'string', example: 'active' },
                          teacherProfile: {
                            type: 'object',
                            properties: {
                              bio: { type: 'string', example: 'Experienced Tajweed teacher' },
                              specialties: {
                                type: 'array',
                                items: { type: 'string' },
                                example: ['Tajweed', 'Hifz'],
                              },
                              programPreference: {
                                type: 'array',
                                items: { type: 'string' },
                                example: ['MemorizationProgram', 'CorrectionProgram'],
                              },
                              hourly_rate: { type: 'number', example: 12 },
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
          404: {
            description: 'No active teachers found',
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

    '/teachers/trials': {
      get: {
        tags: ['Teachers'],
        summary: 'Get all trial sessions (admin only)',
        description: `
Returns all trial sessions in the system, whether they are:

- pending  
- scheduled  
- completed  
- cancelled  

Admin access only.
    `,
        security: [{ FirebaseUidAuth: [] }],
        responses: {
          200: {
            description: 'List of all trial sessions',
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
                          _id: { type: 'string', example: '6914b63a617ce39fe9646a1c' },
                          program: { type: 'string', example: '690a6dd1652bdea9c1ca005b' },
                          programModel: {
                            type: 'string',
                            enum: [
                              'CorrectionProgram',
                              'MemorizationProgram',
                              'ChildMemorizationProgram',
                            ],
                            example: 'CorrectionProgram',
                          },
                          student: {
                            type: 'object',
                            properties: {
                              _id: { type: 'string', example: '690f6a32470c4db837fc02a5' },
                              name: { type: 'string', example: 'Abdullah' },
                              email: { type: 'string', example: 'student@gmail.com' },
                            },
                          },
                          teacher: {
                            type: 'object',
                            properties: {
                              _id: { type: 'string', example: '68fe72e608a6a18c0ec78d56' },
                              name: { type: 'string', example: 'Sheikh Ahmed' },
                              email: { type: 'string', example: 'teacher@gmail.com' },
                            },
                          },
                          duration: { type: 'number', example: 30 },
                          status: {
                            type: 'string',
                            enum: ['pending', 'scheduled', 'completed', 'cancelled'],
                            example: 'scheduled',
                          },
                          scheduledAt: { type: 'string', format: 'date-time' },
                          meetingId: { type: 'string', example: 'a41c9bb92c17e2ef' },
                          preferredTimes: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['6-9_am', '2-5_pm'],
                          },
                          days: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['sunday', 'tuesday', 'thursday'],
                          },
                          createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-11-12T16:30:50.128Z',
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
            description: 'Forbidden — only admins may access this route',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized — missing or invalid Firebase UID',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/teachers/assign-program/{teacherId}': {
      patch: {
        tags: ['Teachers'],
        summary: 'Assign or update a teacher’s program specialization (admin only)',
        description: `
Allows an admin to assign which program(s) a teacher is specialized in.

Valid program preferences:
- CorrectionProgram  
- MemorizationProgram  
- ChildMemorizationProgram  
`,
        security: [{ FirebaseUidAuth: [] }],
        parameters: [
          {
            name: 'teacherId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the teacher to update',
            example: '68fe72e608a6a18c0ec78d56',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  programPreference: {
                    type: 'array',
                    items: {
                      type: 'string',
                      enum: [
                        'CorrectionProgram',
                        'MemorizationProgram',
                        'ChildMemorizationProgram',
                      ],
                    },
                    example: ['MemorizationProgram', 'ChildMemorizationProgram'],
                  },
                },
                required: ['programPreference'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Teacher specialization updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: {
                      type: 'string',
                      example: 'Teacher program specialization updated',
                    },
                    teacher: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', example: '68fe72e608a6a18c0ec78d56' },
                        name: { type: 'string', example: 'Aisha' },
                        email: { type: 'string', example: 'teacher@gmail.com' },
                        role: { type: 'string', example: 'teacher' },
                        teacherProfile: {
                          type: 'object',
                          properties: {
                            programPreference: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['CorrectionProgram', 'MemorizationProgram'],
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
            description: 'Validation error — programPreference must be an array',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Teacher not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden — only admin can update specialization',
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
