import { SafetyTest } from '../types';

export const safetyTests: SafetyTest[] = [
  {
    id: 'workplace-safety',
    title: 'Workplace Safety Fundamentals',
    description: 'Test your knowledge of basic workplace safety protocols and procedures.',
    questions: [
      {
        id: 'ws-1',
        question: 'What should you do before using any power tool?',
        options: [
          'Just start using it immediately',
          'Inspect it for damage and ensure it\'s properly maintained',
          'Ask someone else to use it instead',
          'Only check if it\'s plugged in'
        ],
        correctAnswer: 1
      },
      {
        id: 'ws-2',
        question: 'When should you wear safety glasses?',
        options: [
          'Only when grinding or cutting',
          'Only when working with chemicals',
          'Whenever there\'s a risk of eye injury from flying particles, chemicals, or bright lights',
          'Only when required by law'
        ],
        correctAnswer: 2
      },
      {
        id: 'ws-3',
        question: 'What is the proper way to lift heavy objects?',
        options: [
          'Bend your back and keep legs straight',
          'Lift with your back muscles only',
          'Keep your back straight and lift with your legs',
          'Twist your body while lifting'
        ],
        correctAnswer: 2
      },
      {
        id: 'ws-4',
        question: 'If you see a safety hazard in the workplace, you should:',
        options: [
          'Ignore it if it doesn\'t affect you directly',
          'Report it immediately to your supervisor',
          'Try to fix it yourself without telling anyone',
          'Wait until someone else notices it'
        ],
        correctAnswer: 1
      },
      {
        id: 'ws-5',
        question: 'What should you do if you hear the fire alarm?',
        options: [
          'Finish what you\'re working on first',
          'Immediately evacuate using the nearest exit',
          'Look around to see if there\'s actually a fire',
          'Wait for someone to tell you what to do'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'electrical-safety',
    title: 'Electrical Safety',
    description: 'Learn essential electrical safety practices to prevent accidents and injuries.',
    questions: [
      {
        id: 'es-1',
        question: 'Before working on electrical equipment, you should:',
        options: [
          'Just turn off the main switch',
          'Lock out and tag out the power source',
          'Ask someone to watch you work',
          'Work quickly to minimize exposure'
        ],
        correctAnswer: 1
      },
      {
        id: 'es-2',
        question: 'What should you do if you see a frayed electrical cord?',
        options: [
          'Tape it up and continue using it',
          'Report it and stop using the equipment immediately',
          'Use it carefully to avoid the damaged area',
          'Only use it for light tasks'
        ],
        correctAnswer: 1
      },
      {
        id: 'es-3',
        question: 'When using electrical tools in wet conditions:',
        options: [
          'It\'s okay if you\'re careful',
          'Use GFCI-protected outlets or don\'t use electrical tools',
          'Dry the tools first, then it\'s safe',
          'Wear rubber gloves for protection'
        ],
        correctAnswer: 1
      },
      {
        id: 'es-4',
        question: 'The proper PPE for electrical work includes:',
        options: [
          'Just safety glasses',
          'Insulated gloves, safety glasses, and appropriate clothing',
          'Only steel-toed boots',
          'Regular work gloves are sufficient'
        ],
        correctAnswer: 1
      },
      {
        id: 'es-5',
        question: 'If someone is being electrocuted, you should:',
        options: [
          'Touch them to pull them away from the source',
          'Turn off the power source first, then provide aid',
          'Pour water on them to conduct electricity away',
          'Wait for emergency services to arrive'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'chemical-safety',
    title: 'Chemical Safety',
    description: 'Understand proper handling, storage, and disposal of chemicals in the workplace.',
    questions: [
      {
        id: 'cs-1',
        question: 'Where can you find information about chemical hazards?',
        options: [
          'By asking coworkers',
          'Safety Data Sheets (SDS)',
          'Online forums',
          'Product packaging only'
        ],
        correctAnswer: 1
      },
      {
        id: 'cs-2',
        question: 'When mixing chemicals, you should:',
        options: [
          'Mix them in any order',
          'Always follow specific procedures and never mix incompatible chemicals',
          'Mix small amounts first to test',
          'Guess based on similar chemicals'
        ],
        correctAnswer: 1
      },
      {
        id: 'cs-3',
        question: 'If chemicals splash in your eyes, you should:',
        options: [
          'Rub your eyes to remove the chemical',
          'Immediately flush with clean water for at least 15 minutes',
          'Wait to see if it burns before taking action',
          'Use a towel to wipe your eyes'
        ],
        correctAnswer: 1
      },
      {
        id: 'cs-4',
        question: 'Chemical waste should be:',
        options: [
          'Poured down the drain if diluted',
          'Disposed of according to regulations and SDS instructions',
          'Mixed with other waste to dilute it',
          'Stored indefinitely until full'
        ],
        correctAnswer: 1
      },
      {
        id: 'cs-5',
        question: 'When should you wear a respirator when working with chemicals?',
        options: [
          'Only if you can smell the chemical',
          'When specified by SDS or when vapor concentrations exceed safe limits',
          'Never, ventilation is always sufficient',
          'Only when working with acids'
        ],
        correctAnswer: 1
      }
    ]
  }
];