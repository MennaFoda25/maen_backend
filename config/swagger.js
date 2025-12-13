module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Quraan Tutor API',
    version: '1.0.0',
    description: 'API docs for Quraan Tutor backend..',
  },
  servers: [
    {
    //  url: 'http://localhost:3000/api/v1',
       url: 'https://maen-backend.onrender.com/api/v1',
      // description: 'local dev server',
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
          'Enter your Firebase UID here. This header replaces Firebase Uid and is required for authenticated routes.',
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
      Session: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '692453c40f6b9fbcbbb7f466' },
          program: { type: 'string' },
          programModel: { type: 'string', example: 'MemorizationProgram' },
          student: { type: 'string' },
          teacher: { type: 'string' },
          type: { type: 'string', enum: ['trial', 'program'] },
          status: { type: 'string', enum: ['pending', 'scheduled', 'started', 'completed'] },
          duration: { type: 'number', example: 30 },
          scheduledAt: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: { type: 'string', example: 'sunday' },
                slots: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { start: { type: 'string', example: '18:00' } },
                  },
                },
              },
            },
          },
          createdAt: { type: 'string' },
        },
      },

      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'Invalid input' },
        },
      },
      Event: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Ramadan Offer' },
          description: { type: 'string', example: 'Special discount for Ramadan' },
          imageUrl: { type: 'string', example: 'https://example.com/banner.png' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          isActive: {
            type: 'boolean',
            example: true,
            description: 'Admin-controlled flag. Automatically set to false if endDate has passed.',
          },
          price: {
            type: 'Number',
          },
          computedStatus: {
            type: 'string',
            enum: ['active', 'inactive'],
            example: 'active',
            description:
              'Computed at runtime: "active" if between startDate and endDate, "inactive" otherwise',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ChatConversationResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          conversation: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              participants: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    profile_picture: { type: 'string' },
                  },
                },
              },
              lastMessage: { type: 'string', example: 'السلام عليكم' },
              lastMessageAt: { type: 'string', format: 'date-time' },
              messages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    sender: { type: 'string' },
                    text: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
      MyConversationsResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          count: { type: 'number' },
          conversations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                participants: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      name: { type: 'string' },
                      profile_picture: { type: 'string' },
                    },
                  },
                },
                lastMessage: { type: 'string' },
                lastMessageAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      GetMessagesResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          conversationId: { type: 'string' },
          participants: {
            type: 'array',
            items: { type: 'string' },
          },
          messages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sender: { type: 'string' },
                text: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },

      Message: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          sender: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
            },
          },
          text: { type: 'string' },
          attachmentUrl: { type: 'string' },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      GetMessagesResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          messages: {
            type: 'array',
            items: { $ref: '#/components/schemas/Message' },
          },
        },
      },
      MyConversationsResponse: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          count: { type: 'number' },
          conversations: {
            type: 'array',
            items: { $ref: '#/components/schemas/ChatConversationResponse' },
          },
        },
      },
      CorrectionProgram: {
        type: 'object',
        properties: {
          teacher: { $ref: '#/components/schemas/TeacherProfile' },
          goal: {
            type: 'String',
            example:
              'general_mistakes or hidden_mistakes or ijazah_preparation or performance_development',
          },
          currentLevel: { type: 'String', example: 'beginner or intermediate or advanced' },
          weeklySessions: { type: 'Number', example: '1 , 2,3,4,5' },
          sessionDuration: { type: 'Number', example: '15,30,45,60' },
          preferredTimes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: {
                  type: 'string',
                  enum: [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                  ],
                  example: 'sunday',
                },
                start: {
                  type: 'string',
                  example: '17:00',
                },
              },
            },
            example: [
              { day: 'sunday', start: '17:00' },
              { day: 'tuesday', start: '17:00' },
            ],
          },
          planName: { type: 'String' },
          packageDuration: { type: 'Number' },
          fromSurah: { type: 'String' },
          toSurah: { type: 'String' },
          audioReferences: { type: 'String' },
          pagesPerSession: { type: 'Number' },
          totalPages: { type: 'Number' },
          completedPages: { type: 'Number' },
        },
      },
      MemorizationProgram: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '691c0012ab3cd1234f112233' },

          student: {
            type: 'string',
            example: '690f6a32470c4db837fc02a5',
          },

          teacher: {
            type: 'string',
            example: '68fe72e608a6a18c0ec78d56',
          },

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
          packageDuration: { type: 'number' },

          preferredTimes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: {
                  type: 'string',
                  enum: [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                  ],
                  example: 'sunday',
                },
                start: {
                  type: 'string',
                  example: '17:00',
                },
              },
            },
            example: [
              { day: 'sunday', start: '17:00' },
              { day: 'tuesday', start: '17:00' },
            ],
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

          status: {
            type: 'string',
            enum: ['active', 'completed', 'paused'],
            example: 'active',
          },

          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ChildMemorizationProgram: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '691c00bb218cce45f1122445' },

          parent: { type: 'string', example: '690f6a32470c4db837fc02a5' },
          teacher: { type: 'string', example: '68fe72e608a6a18c0ec78d56' },

          childName: { type: 'string', example: 'Omar Mohamed' },
          childGender: { type: 'string', enum: ['male', 'female'], example: 'male' },
          childAge: { type: 'number', example: 7 },

          hasStudiedBefore: { type: 'boolean', example: true },
          memorizedParts: { type: 'string', example: 'Juz Amma, Al-Fatihah' },

          readingLevel: {
            type: 'string',
            enum: ['no_reading', 'phonetic', 'fluent'],
            example: 'fluent',
          },

          mainGoal: {
            type: 'string',
            enum: ['start_from_zero', 'revision', 'tajweed_improvement'],
            example: 'start_from_zero',
          },

          weeklySessions: { type: 'number', example: 3 },
          sessionDuration: { type: 'number', example: 30 },
          packageDuration: { type: 'number' },

          preferredTimes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: {
                  type: 'string',
                  enum: [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                  ],
                  example: 'sunday',
                },
                start: {
                  type: 'string',
                  example: '17:00',
                },
              },
            },
            example: [
              { day: 'sunday', start: '17:00' },
              { day: 'tuesday', start: '17:00' },
            ],
          },

          teacherGender: {
            type: 'string',
            enum: ['male', 'female'],
            example: 'female',
          },

          notes: { type: 'string', example: 'Shy, struggles with ص' },

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

          status: {
            type: 'string',
            enum: ['active', 'completed', 'paused'],
            example: 'active',
          },

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
      ProgramTypeListResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          count: { type: 'number', example: 3 },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '691b9db0a54c5ba22b4be2f3' },
                name: { type: 'string', example: 'Memorization Program' },
                description: { type: 'string', example: 'Quran memorization and revision' },
                teachers: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/UserShort' },
                },
              },
            },
          },
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
    summary: 'Get current authenticated user',
    description: `
Returns the logged-in user (MongoDB User).
Optionally saves the user's notification token if provided in request body.
    `,
    security: [{ FirebaseUidAuth: [] }],
    requestBody: {
      required: false,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              notificationToken: {
                type: 'string',
                example: 'fcm_device_token_here',
                description: 'Optional — sent by frontend to register/update user notification token',
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Current user data',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'User retrieved successfully' },
                status: { type: 'string', example: 'active' },
                user: { $ref: '#/components/schemas/UserShort' },
                notificationToken: {
                  type: 'string',
                  example: 'fcm_device_token_here',
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
    },
  },
},


    '/teacherRequest': {
      post: {
        tags: ['TeacherRequest'],
        summary:
          'Create a teacher request (student upgrade OR teacher first-login). Requires Firebase Uid.',
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
            description: `
Approves or rejects a teacher request.
If frontend sends a notification object, it is delivered to the teacher.
    `,
        security: [{ FirebaseUidAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                                required: ['status'],

                properties: {
                  status: { type: 'string', enum: ['approved', 'rejected'] },
                  reason: { type: 'string', description: 'optional rejection reason' },
                  notification: {
                type: 'object',
                nullable: true,
                properties: {
                  title: { type: 'string', example: 'Your application was approved' },
                  body: { type: 'string', example: 'Welcome aboard!' },
                },
              },
            },
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
Supports multipart/form-data for file uploads:
- profile_picture: Upload new profile image (jpg, png, webp, max 10MB)
- certificates: Upload teacher certificates (pdf, jpg, png, max 10MB each, up to 10 files)

Also supports updating text fields:
- name, email, phone, slug (common fields)
- learning_goals, current_level (student fields)
- bio, specialties, hourly_rate, availabilitySchedule (teacher fields)

Password cannot be changed here (use /changeMyPassword endpoint instead).
        `,
        security: [{ FirebaseUidAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Updated Name', nullable: true },
                  email: { type: 'string', example: 'updated@gmail.com', nullable: true },
                  phone: { type: 'string', example: '01100200300', nullable: true },
                  slug: { type: 'string', example: 'updated-name', nullable: true },
                  profile_picture: {
                    type: 'string',
                    format: 'binary',
                    description:
                      'Profile picture image file (jpg, png, webp, max 10MB). For students & teachers.',
                    nullable: true,
                  },

                  // Student fields
                  learning_goals: {
                    type: 'string',
                    example: 'Hifz,Tajweed',
                    description: 'Comma-separated or array of learning goals',
                    nullable: true,
                  },
                  current_level: {
                    type: 'string',
                    example: 'intermediate',
                    description: 'Current Quraan proficiency level',
                    nullable: true,
                  },

                  // Teacher fields
                  bio: { type: 'string', example: 'Experienced Quran tutor', nullable: true },
                  specialties: {
                    type: 'string',
                    example: 'Tajweed,Grammar',
                    description: 'Comma-separated teaching specialties',
                    nullable: true,
                  },
                  hourly_rate: { type: 'number', example: 20, nullable: true },
                  availabilitySchedule: {
                    type: 'string',
                    example: 'sunday-10-12,monday-8-10',
                    description: 'Comma-separated availability slots',
                    nullable: true,
                  },
                  certificates: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description:
                      'Certificate files for teachers (pdf, jpg, png, up to 10 files, max 10MB each). Can also send certificate names as comma-separated text.',
                    nullable: true,
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
            description: 'Password update attempt, validation error, or file upload error',
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
        summary: 'Create an admin (requires Firebase Uid)',
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
            description: 'Missing Firebase Uid',
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
        security: [{ FirebaseUidAuth: [] }],
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
    '/users/myPlans': {
      get: {
        tags: ['User'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Get all plans and sessions for the logged-in student',
        description:
          'Returns all Correction, Memorization, and Child Memorization programs for the authenticated student, each with their associated sessions, teacher info, and session summary.',
        responses: {
          200: {
            description: 'Plans and sessions retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    totalPlans: { type: 'number', example: 3 },
                    totalSessions: { type: 'number', example: 12 },
                    sessionsSummary: {
                      type: 'object',
                      properties: {
                        total: { type: 'number', example: 12 },
                        pending: { type: 'number', example: 1 },
                        scheduled: { type: 'number', example: 6 },
                        started: { type: 'number', example: 2 },
                        completed: { type: 'number', example: 3 },
                        cancelled: { type: 'number', example: 0 },
                      },
                    },
                    data: {
                      type: 'object',
                      properties: {
                        memorizationPrograms: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/MemorizationProgram',
                          },
                        },
                        correctionPrograms: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/CorrectionProgram',
                          },
                        },
                        childMemorizationPrograms: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/ChildMemorizationProgram',
                          },
                        },
                        allPlans: {
                          type: 'array',
                          description: 'All plans combined and sorted by creation date',
                          items: {
                            type: 'object',
                            properties: {
                              _id: { type: 'string' },
                              programType: {
                                type: 'string',
                                enum: [
                                  'MemorizationProgram',
                                  'CorrectionProgram',
                                  'ChildMemorizationProgram',
                                ],
                              },
                              teacher: {
                                type: 'object',
                                properties: {
                                  name: { type: 'string' },
                                  email: { type: 'string' },
                                  profile_picture: { type: 'string' },
                                },
                              },
                              sessions: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Session' },
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
          401: {
            description: 'Unauthorized – Student not logged in',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    // '/users/changeMyPassword': {
    //   put: {
    //     tags: ['User'],
    //     summary: "Change logged-in user's password (Firebase only)",
    //     security: [{ FirebaseUidAuth: [] }],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         'application/json': {
    //           schema: {
    //             type: 'object',
    //             properties: { newPassword: { type: 'string', example: '12345678' } },
    //           },
    //         },
    //       },
    //     },
    //     responses: {
    //       200: {
    //         description: 'Password changed successfully',
    //       },
    //     },
    //   },
    // },
    '/users/{id}/suspend': {
      put: {
        tags: ['Admin'],
        summary: 'Suspend or activate a user (admin only)',
        description:
          'Update user status to active or inactive. Body: { status: "active" | "inactive" }',
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
            description: 'User status updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'user status has changed successfully' },
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

                  weeklySessions: { type: 'number', example: 2 },
                  sessionDuration: { type: 'number', example: 30 },
                  packageDuration: { type: 'number', example: 1 },

                  preferredTimes: {
                    type: 'array',
                    description: 'List of preferred time slots',
                    items: {
                      type: 'object',
                      properties: {
                        day: {
                          type: 'string',
                          enum: [
                            'sunday',
                            'monday',
                            'tuesday',
                            'wednesday',
                            'thursday',
                            'friday',
                            'saturday',
                          ],
                          example: 'sunday',
                        },
                        start: { type: 'string', example: '17:00' },
                      },
                    },
                    example: [
                      { day: 'sunday', start: '17:00' },
                      { day: 'tuesday', start: '18:00' },
                    ],
                  },
                  // Days: {
                  //   type: 'array',
                  //   items: { type: 'string' },
                  //   example: ['sunday', 'tuesday'],
                  // },

                  fromSurah: { type: 'string', example: 'Al-Fatihah' },
                  toSurah: { type: 'string', example: 'Al-Baqarah' },

                  pagesPerSession: { type: 'number', example: 1 },
                  totalPages: { type: 'number', example: 20 },

                  teacher: { type: 'string', example: '68fdeb64c53906d3a283b8bf' },
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
        tags: ['Correction Program'],
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
                  childGender: { type: 'string', enum: ['male', 'female'], example: 'male' },
                  childAge: { type: 'number', example: 7 },

                  hasStudiedBefore: { type: 'boolean', example: true },
                  memorizedParts: { type: 'string', example: 'Juz Amma, Al-Fatihah' },

                  readingLevel: {
                    type: 'string',
                    enum: ['no_reading', 'phonetic', 'fluent'],
                    example: 'phonetic',
                  },

                  mainGoal: {
                    type: 'string',
                    enum: ['start_from_zero', 'revision', 'tajweed_improvement'],
                    example: 'start_from_zero',
                  },

                  weeklySessions: { type: 'number', example: 3 },
                  sessionDuration: { type: 'number', example: 30 },
                  packageDuration: { type: 'number', example: 1 },
                  preferredTimes: {
                    type: 'array',
                    description: 'List of preferred time slots',
                    items: {
                      type: 'object',
                      properties: {
                        day: {
                          type: 'string',
                          enum: [
                            'sunday',
                            'monday',
                            'tuesday',
                            'wednesday',
                            'thursday',
                            'friday',
                            'saturday',
                          ],
                          example: 'sunday',
                        },
                        start: { type: 'string', example: '17:00' },
                      },
                    },
                    example: [
                      { day: 'sunday', start: '17:00' },
                      { day: 'tuesday', start: '18:00' },
                    ],
                  },
                  teacherGender: {
                    type: 'string',
                    enum: ['male', 'female'],
                    example: 'female',
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
            description: 'Unauthorized - missing Firebase Uid',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/programs/child/all': {
      get: {
        tags: ['Child Memorization Program'],
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
            description: 'Unauthorized - Missing or invalid Firebase Uid',
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
                  packageDuration: { type: 'number', example: 1 },

                  preferredTimes: {
                    type: 'array',
                    description: 'List of preferred time slots',
                    items: {
                      type: 'object',
                      properties: {
                        day: {
                          type: 'string',
                          enum: [
                            'sunday',
                            'monday',
                            'tuesday',
                            'wednesday',
                            'thursday',
                            'friday',
                            'saturday',
                          ],
                          example: 'sunday',
                        },
                        start: { type: 'string', example: '17:00' },
                      },
                    },
                    example: [
                      { day: 'sunday', start: '17:00' },
                      { day: 'tuesday', start: '18:00' },
                    ],
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
            description: 'Unauthorized - Missing Firebase Uid',
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
        tags: ['Memorization Program'],
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
    '/programs': {
      get: {
        tags: ['Program Types'],
        summary: 'Get all program types with the teachers assigned to each one',
        description: 'Returns the 3 program types and the teachers specialized in each one.',
        security: [{ FirebaseUidAuth: [] }],
        responses: {
          200: {
            description: 'List of program types',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProgramTypeListResponse' },
              },
            },
          },
        },
      },
    },
    '/programs/{id}': {
      get: {
        tags: ['Programs'],
        summary: 'Get teachers assigned to a specific program type',
        description:
          'Returns all active teachers whose `programPreference` contains the given program type ID.',
        security: [{ FirebaseUidAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Program Type ID (ProgramType._id)',
            example: '691b9db0a54c5ba22b4be2f3',
          },
        ],
        responses: {
          200: {
            description: 'Teachers assigned to this program type',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number', example: 1 },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', example: '6915e2350b32ecdcf4bacb12' },
                          name: { type: 'string', example: 'Aisha Ahmed' },
                          email: { type: 'string', example: 'teacher@gmail.com' },
                          profile_picture: { type: 'string' },
                          rating: { type: 'number', example: 4.7 },
                          teacherProfile: {
                            type: 'object',
                            properties: {
                              programPreference: {
                                type: 'array',
                                items: { type: 'string' },
                                example: ['691b9db0a54c5ba22b4be2f3', '691b9de2a54c5ba22b4be2f7'],
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
          404: {
            description: 'No teachers found for this program type',
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
        },
      },
      delete: {
        tags: ['Programs'],
        summary: 'Delete a program owned by the logged-in student',
        description: `
           Allows the authenticated student (or parent in child programs) to delete ONLY programs they own.`,
        security: [{ FirebaseUidAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Program ID to delete',
            schema: { type: 'string', example: '64afc12345ed909ab12cd345' },
          },
        ],
        responses: {
          200: {
            description: 'Program deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Program deleted successfully' },
                  },
                },
              },
            },
          },
          403: {
            description: 'User is not allowed to delete this program (not owner)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Program not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized — authentication failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/programs/student/myPrograms': {
      get: {
        tags: ['Programs'],
        summary: 'Get all programs for the logged-in student',
        description: `
Returns all programs belonging to the authenticated student:
- Memorization Programs
- Correction Programs
- Child Memorization Programs
`,
        security: [{ FirebaseUidAuth: [] }],

        responses: {
          200: {
            description: 'List of all programs for the logged-in student',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number', example: 3 },
                    data: {
                      type: 'object',
                      properties: {
                        memorizationPrograms: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/MemorizationProgram' },
                        },
                        correctionPrograms: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/CorrectionProgram' },
                        },
                        childPrograms: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/ChildMemorizationProgram' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          401: {
            description: 'Unauthorized - missing or invalid Firebase token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/programs/assignTeacher/{id}': {
      patch: {
        tags: ['Programs'],
        summary: 'Assign a teacher to a program and generate trial + plan sessions',
        description: `
Assigns a teacher to a program (Correction, Memorization, or Child).
Automatically generates:
- Trial session (if enabled)
- Full program plan sessions (if not generated before)
Also triggers:
- Notification to teacher: "You have been assigned to a new student"
- Notification to student: "Your teacher has been assigned and plan is ready"
    
`,
        security: [{ FirebaseUidAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Program ID',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['teacherId'],
                properties: {
                  teacherId: {
                    type: 'string',
                    example: '6915e2350b32ecdcf4bacb12',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Teacher assigned and sessions generated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: {
                      type: 'string',
                      example: 'Teacher assigned successfully. Trial + plan sessions generated.',
                    },
                    teacherId: { type: 'string' },
                    trialSession: { type: 'object', nullable: true },
                    createdSessionsCount: { type: 'number' },
                    createdSessions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Session' },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid request (missing teacherId or invalid data)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Program or Teacher not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/programs/available/{id}': {
      get: {
        tags: ['Programs'],
        summary: 'Get teachers whose availability matches the program preferred times',
        description: `
Returns teachers whose weekly availability matches the program's preferredTimes.
Works for:
- Correction Programs
- Memorization Programs
- Child Programs
`,
        security: [{ FirebaseUidAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Program ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Available teachers retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number' },
                    programId: { type: 'string' },
                    programModel: { type: 'string' },
                    preferredTimes: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          day: { type: 'string' },
                          start: { type: 'string' },
                          end: { type: 'string' },
                        },
                      },
                    },
                    teachers: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          name: { type: 'string' },
                          profile_picture: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'PreferredTimes missing or invalid',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Program not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'ProgramType not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/programs/student/{id}': {
      delete: {
        tags: ['Programs'],
        summary: 'Delete a program owned by the logged-in student',
        description: `
    Allows the authenticated student (or parent in child programs) to delete only programs they own.

    Supported program types:
    - Memorization Program
    - Correction Program
    - Child Memorization Program

    The API validates ownership before deletion.
    `,
        security: [{ FirebaseUidAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Program ID to delete',
            schema: { type: 'string', example: '64afc12345ed909ab12cd345' },
          },
        ],

        responses: {
          200: {
            description: 'Program deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Program deleted successfully' },
                  },
                },
              },
            },
          },

          403: {
            description: 'User is not allowed to delete this program (not owner)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },

          404: {
            description: 'Program not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },

          401: {
            description: 'Unauthorized — authentication failed',
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
    '/teachers/{id}/schedules': {
      get: {
        tags: ['Teachers'],
        summary: 'Get teacher schedule by ID',
        description: 'Returns the availability schedule of a specific teacher by their ID.',
        security: [{ FirebaseUidAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Teacher ID to get schedule',
            schema: { type: 'string', example: '690a3f18e09ab30fc38467f8' },
          },
        ],
        responses: {
          200: {
            description: 'Teacher schedule retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
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
    // '/sessions/book': {
    //   post: {
    //     tags: ['Sessions'],
    //     security: [{ FirebaseUidAuth: [] }],
    //     summary: 'Book a single session for a program',
    //     requestBody: {
    //       required: true,
    //       content: {
    //         'application/json': {
    //           schema: {
    //             type: 'object',
    //             required: ['programId', 'programModel', 'teacherId', 'scheduledAt'],
    //             properties: {
    //               programId: {
    //                 type: 'string',
    //                 example: '677bf39fdd4f30f40cb15f94',
    //               },
    //               programModel: {
    //                 type: 'string',
    //                 enum: ['CorrectionProgram', 'MemorizationProgram', 'ChildMemorizationProgram'],
    //                 example: 'MemorizationProgram',
    //               },
    //               teacherId: {
    //                 type: 'string',
    //                 example: '677a89d55b31812cd45dc342',
    //               },
    //               scheduledAt: {
    //                 type: 'object',
    //                 properties: {
    //                   day: {
    //                     type: 'string',
    //                     enum: [
    //                       'sunday',
    //                       'monday',
    //                       'tuesday',
    //                       'wednesday',
    //                       'thursday',
    //                       'friday',
    //                       'saturday',
    //                     ],
    //                     example: 'monday',
    //                   },
    //                   start: {
    //                     type: 'string',
    //                     example: '15:00',
    //                   },
    //                 },
    //               },
    //               scheduledAtDate: {
    //                 type: 'string',
    //                 format: 'date-time',
    //                 example: '2025-03-02T15:00:00.000Z',
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //     responses: {
    //       201: {
    //         description: 'Session booked successfully',
    //         content: {
    //           'application/json': {
    //             schema: { $ref: '#/components/schemas/Session' },
    //           },
    //         },
    //       },
    //       400: { description: 'Invalid time or teacher not available' },
    //       403: { description: 'Teacher inactive or blocked' },
    //       404: { description: 'Program or teacher not found' },
    //     },
    //   },
    // },
    // '/sessions/{id}/generatePlan': {
    //   post: {
    //     tags: ['Sessions'],
    //     security: [{ FirebaseUidAuth: [] }],
    //     summary: 'Generate full recurring schedule for a program',
    //     parameters: [
    //       {
    //         in: 'path',
    //         name: 'id',
    //         required: true,
    //         schema: { type: 'string' },
    //         description: 'Program ID',
    //       },
    //     ],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         'application/json': {
    //           schema: {
    //             type: 'object',
    //             required: ['programModel'],
    //             properties: {
    //               programModel: {
    //                 type: 'string',
    //                 enum: ['CorrectionProgram', 'MemorizationProgram', 'ChildMemorizationProgram'],
    //                 example: 'CorrectionProgram',
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //     responses: {
    //       201: {
    //         description: 'Plan sessions generated successfully',
    //         content: {
    //           'application/json': {
    //             schema: {
    //               type: 'object',
    //               properties: {
    //                 status: { type: 'string', example: 'success' },
    //                 totalCreated: { type: 'number', example: 12 },
    //                 sessions: {
    //                   type: 'array',
    //                   items: { $ref: '#/components/schemas/Session' },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //       400: { description: 'Invalid preferred times or missing data' },
    //       403: { description: 'Teacher is not dedicated to this program type' },
    //       404: { description: 'Program or teacher not found' },
    //     },
    //   },
    // },

    '/sessions/{id}/start': {
      patch: {
        tags: ['Sessions'],
        summary: 'Mark session as started',
  description: `
Marks a session as started.
If frontend provides a {title, body} notification object, it is sent to both student and teacher.
    `,        security: [{ FirebaseUidAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Session ID',
          },
        ],
          requestBody: {
      required: false,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              notification: {
                type: 'object',
                nullable: true,
                properties: {
                  title: { type: 'string', example: 'Session Started' },
                  body: { type: 'string', example: 'Your session has just started.' },
                },
              },
            },
          },
        },
      },
    },
        responses: {
          200: {
            description: 'Session has started',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Session has started' },
                    data: { $ref: '#/components/schemas/Session' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/sessions/{id}/complete': {
      patch: {
        tags: ['Sessions'],
        summary: 'Mark session as completed',
        description: `
Marks a session as completed.
Automatically adds session.duration to teacher.fulfilledMinutes.
If notification object is provided, send to student + teacher.
    `,
        security: [{ FirebaseUidAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Session ID',
          },
        ],
         requestBody: {
      required: false,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              notification: {
                type: 'object',
                nullable: true,
                properties: {
                  title: { type: 'string', example: 'Session Completed' },
                  body: { type: 'string', example: 'Your session has been completed.' },
                },
              },
            },
          },
        },
      },
    },
        responses: {
          200: {
            description: 'Session completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Session marked as completed' },
                    data: { $ref: '#/components/schemas/Session' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/teachers/mySessions': {
      get: {
        tags: ['Sessions'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Get all sessions for the authenticated teacher',
        responses: {
          200: {
            description: 'List of sessions grouped by status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number', example: 7 },
                    summary: {
                      type: 'object',
                      properties: {
                        pending: { type: 'number', example: 1 },
                        scheduled: { type: 'number', example: 3 },
                        started: { type: 'number', example: 1 },
                        completed: { type: 'number', example: 2 },
                        cancelled: { type: 'number', example: 0 },
                      },
                    },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Session' },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/programs/{id}': {
      get: {
        tags: ['Program Types'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Get all active teachers specialized in a specific program type',
        description:
          'Returns all active teachers whose teacherProfile.programPreference includes the given ProgramType ID.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ProgramType ID to filter teachers by',
            example: '691b9df3a54c5ba22b4be2fb',
          },
        ],
        responses: {
          200: {
            description: 'List of teachers specialized in the program type',
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
                          role: { type: 'string', example: 'teacher' },
                          teacherProfile: {
                            type: 'object',
                            properties: {
                              programPreference: {
                                type: 'array',
                                description: 'Populated ProgramType objects',
                                items: {
                                  type: 'object',
                                  properties: {
                                    _id: { type: 'string' },
                                    name: { type: 'string' },
                                    key: { type: 'string' },
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
          404: {
            description: 'ProgramType or Teachers not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
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
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Assign or update teacher program specialization',
        description:
          'Assign a set of program types (ProgramType IDs) to a teacher. This updates the teacherProfile.programPreference array.',
        parameters: [
          {
            name: 'teacherId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Teacher ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['programPreference'],
                properties: {
                  programPreference: {
                    type: 'array',
                    items: { type: 'string', example: '672b9db0a54c5ba22b4be2f3' },
                    description: 'Array of ProgramType IDs',
                  },
                },
              },
              example: {
                programPreference: ['672b9db0a54c5ba22b4be2f3', '672b9db0a54c5ba22b4be1aa'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Teacher specialization updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          404: {
            description: 'Teacher not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/events': {
      post: {
        tags: ['Events'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Create a new event (Admin only)',
  description: `
Creates a new event with image upload and date range.
Optionally triggers push notifications to all students IF the frontend provides a notification object.
    `,        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Ramadan Offer' },
                  description: { type: 'string', example: 'Special discount during Ramadan' },
                  startDate: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-02-01T00:00:00Z',
                  },
                  endDate: { type: 'string', format: 'date-time', example: '2025-02-15T23:59:59Z' },
                  eventImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Event banner image',
                  },
                  price: {
                    type: 'Number',
                    description: 'price the student will pay',
                  },
                     notification: {
                type: 'object',
                nullable: true,
                description: 'Optional — triggers notification to all students',
                properties: {
                  title: { type: 'string', example: 'New Event Available!' },
                  body: { type: 'string', example: 'Check out our Ramadan offer event!' },
                },
              },
                },
                required: ['title', 'startDate', 'endDate', 'eventImage', 'price'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Event created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' },
              },
            },
          },
          400: {
            description: 'Validation error or missing required fields',
          },
        },
      },
      get: {
        tags: ['Events'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Get all events with optional active/inactive filter',
        description:
          'Returns all events. Optionally filter by ?isActive=true or ?isActive=false. Each event includes a computedStatus field (active/inactive) based on current time relative to start/end dates.',
        parameters: [
          {
            name: 'isActive',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['true', 'false'],
            },
            description: 'Filter by admin-controlled isActive field',
          },
        ],
        responses: {
          200: {
            description: 'Events retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'number', example: 3 },
                    totalInDatabase: { type: 'number', example: 5 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Event' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/events/{id}': {
      get: {
        tags: ['Events'],
        summary: 'Get a specific event by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Event retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' },
              },
            },
          },
          404: { description: 'Event not found' },
        },
      },
      patch: {
        tags: ['Events'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Update an event (Admin only)',
        description: 'Allows title, description, dates, active state, and image update.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  isActive: { type: 'boolean' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                  price: { type: 'Number' },
                  eventImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Optional new event image',
                    required: false,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Event updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' },
              },
            },
          },
          404: { description: 'Event not found' },
        },
      },
      delete: {
        tags: ['Events'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Delete an event (Admin only)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Event deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Event deleted successfully' },
                  },
                },
              },
            },
          },
          404: { description: 'Event not found' },
        },
      },
    },
    '/chats': {
      post: {
        tags: ['Chat'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Send a message to another user (teacher or student)',
        description:
          'Creates or finds an existing conversation between two users and pushes a message to it. Supports text or attachment URL.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['receiverId'],
                properties: {
                  receiverId: {
                    type: 'string',
                    description: 'User ID of message receiver',
                    example: '691c486e6a788360931de1c7',
                  },
                  text: {
                    type: 'string',
                    description: 'Text message (optional)',
                    example: 'السلام عليكم',
                  },
                },
              },
              example: {
                receiverId: '691c486e6a788360931de1c7',
                text: 'مرحبا كيف حالك؟',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Message sent successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChatConversationResponse' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          404: {
            description: 'Receiver not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      get: {
        tags: ['Chat'],
        summary: 'Get all conversations for the logged-in user',
        description: 'Returns all conversations where the user is a participant.',
        security: [{ FirebaseUidAuth: [] }],
        responses: {
          200: {
            description: 'List of conversations returned',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MyConversationsResponse',
                },
              },
            },
          },
        },
      },
    },
    '/chats/messages/{receiverId}': {
      get: {
        tags: ['Chat'],
        summary: 'Get all messages for a specific conversation',
        security: [{ FirebaseUidAuth: [] }],
        parameters: [
          {
            name: 'receiverId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: '690f92ee48f44586274b77cf',
          },
        ],
        responses: {
          200: {
            description: 'Messages returned successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/GetMessagesResponse',
                },
              },
            },
          },
          403: { description: 'User is not part of this conversation' },
        },
      },
    },

    '/upload': {
      post: {
        tags: ['MP3 Files'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Upload a new MP3 file',
        description: 'Admin uploads an MP3 file to Cloudinary. Supports mp3, wav, m4a.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'Surah Al-Fatiha',
                  },
                  description: {
                    type: 'string',
                    example: 'Beginner recitation',
                  },
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'MP3/WAV/M4A audio file',
                  },
                },
                required: ['name', 'file'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'MP3 file uploaded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  example: {
                    status: 'success',
                    message: 'file is added successfully',
                    data: {
                      _id: '64df092bda128001c89c2e50',
                      name: 'Surah Al-Fatiha',
                      description: 'Beginner recitation',
                      fileUrl:
                        'https://res.cloudinary.com/demo/raw/upload/v12345/maeen/quran_audio/file.mp3',
                      createdAt: '2025-12-02T23:03:25.729Z',
                      updatedAt: '2025-12-02T23:03:25.729Z',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },

      get: {
        tags: ['MP3 Files'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Get all uploaded MP3 files',
        responses: {
          200: {
            description: 'List of MP3 files',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  example: {
                    status: 'success',
                    results: 2,
                    data: [
                      {
                        _id: '64df092bda128001c89c2e50',
                        name: 'Surah Al-Fatiha',
                        fileUrl: 'https://res.cloudinary.com/.../fatiha.mp3',
                      },
                      {
                        _id: '64df092bda128001c89c2e70',
                        name: 'Surah Al-Baqarah',
                        fileUrl: 'https://res.cloudinary.com/.../baqarah.mp3',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },

    '/upload/{id}': {
      delete: {
        tags: ['MP3 Files'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Delete an MP3 file (Admin only)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'MP3 file ID to delete',
          },
        ],
        responses: {
          200: {
            description: 'MP3 file deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  example: {
                    status: 'success',
                    message: 'File deleted successfully',
                  },
                },
              },
            },
          },
          404: {
            description: 'File not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/pricing': {
      post: {
        tags: ['Pricing'],
        summary: 'Calculate pricing for a plan',
        security: [{ FirebaseUidAuth: [] }],
        description: 'Calculates full pricing details with discount rules and optional promocode.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  teacherLevel: { type: 'string', example: 'مجاز/إجازة' },
                  sessionsPerMonth: { type: 'number', example: 16 },
                  months: { type: 'number', example: 6 },
                  sessionMinutes: { type: 'number', example: 45 },
                  isPeak: { type: 'boolean', example: true },
                  promocode: { type: 'string', example: 'RAMADAN10' },
                },
                required: ['teacherLevel', 'sessionsPerMonth', 'months', 'sessionMinutes'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Successful pricing calculation',
            content: {
              'application/json': {
                schema: {
                  example: {
                    status: 'success',
                    pricing: {
                      teacherLevel: 'مجاز/إجازة',
                      sessionsPerMonth: 16,
                      months: 6,
                      sessionMinutes: 45,
                      isPeak: true,
                    },
                    priceBreakdown: {
                      basePricePerMinute: 1.5,
                      pricePerSession: 67.5,
                      pricePerMinute: 1.2,
                      pricePerHour: 72,
                      monthlyPrice: 1080,
                    },
                    totalPrice: {
                      withoutPromocode: 5400,
                      withPromocode: 4860,
                    },
                    promocode: {
                      valid: true,
                      code: 'RAMADAN10',
                      discountType: 'percentage',
                      discountValue: 10,
                      discountAmount: 540,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/promocode': {
      post: {
        tags: ['Promocode'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Create a new promocode',
        description: 'Admin only — creates a promocode with usage limits.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                example: {
                  code: 'RAMADAN10',
                  discountType: 'percentage',
                  discountValue: 10,
                  validFrom: '2025-01-01',
                  validUntil: '2025-02-01',
                  isActive: true,
                  maxUsagePerUser: 5,
                  globalMaxUsage: 1000,
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Promocode created successfully',
          },
        },
      },

      get: {
        tags: ['Promocode'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Get all promocodes (Admin only)',
        responses: {
          200: {
            description: 'List of promocodes',
            content: {
              'application/json': {
                schema: {
                  example: {
                    status: 'success',
                    results: 2,
                    data: [
                      {
                        code: 'RAMADAN10',
                        discountType: 'percentage',
                        discountValue: 10,
                        totalUsage: 50,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    '/promocode/{id}': {
      patch: {
        tags: ['Promocode'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Update a promocode',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                example: {
                  discountValue: 15,
                  isActive: false,
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Promocode updated',
          },
        },
      },

      delete: {
        tags: ['Promocode'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Delete a promocode',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Promocode deleted',
          },
        },
      },
    },
    '/promocode/apply': {
      post: {
        tags: ['Promocode'],
        security: [{ FirebaseUidAuth: [] }],
        summary: 'Apply a promocode to calculate discount',
        description: 'Does NOT store usage. Only returns calculated discounted price.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                example: {
                  code: 'RAMADAN10',
                  originalPrice: 5400,
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Promocode applied',
            content: {
              'application/json': {
                schema: {
                  example: {
                    status: 'success',
                    promocode: 'RAMADAN10',
                    originalPrice: 5400,
                    discountAmount: 540,
                    finalPrice: 4860,
                    discountType: 'percentage',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
