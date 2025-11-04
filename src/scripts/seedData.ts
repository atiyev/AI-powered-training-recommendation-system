import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/database';
import { User } from '../models/User';
import { Training } from '../models/Training';
import { Project } from '../models/Project';
import { VectorStoreService } from '../services/vectorStoreService';

class DataSeeder {
    private vectorStoreService: VectorStoreService;

    constructor() {
        this.vectorStoreService = new VectorStoreService();
    }

    // Seed users data
    async seedUsers(): Promise<void> {
        console.log('Seeding users data...');

        const users = [
            {
                name: 'Elon',
                department: 'Engineering',
                title: 'senior engineer',
                completedTrainings: ['T232 aws cloud architect for beginner']
            },
            {
                name: 'Sarah Chen',
                department: 'Engineering',
                title: 'frontend developer',
                completedTrainings: ['T124 react for beginner', 'T156 javascript fundamentals']
            },
            {
                name: 'Marcus Johnson',
                department: 'Product',
                title: 'product manager',
                completedTrainings: ['T345 agile methodology', 'T278 product discovery']
            },
            {
                name: 'Priya Sharma',
                department: 'Engineering',
                title: 'devops engineer',
                completedTrainings: ['T232 aws cloud architect for beginner', 'T412 docker & kubernetes']
            },
            {
                name: 'David Kim',
                department: 'Sales',
                title: 'sales engineer',
                completedTrainings: ['T278 product discovery', 'T501 presentation skills']
            },
            {
                name: 'Lisa Wang',
                department: 'Engineering',
                title: 'fullstack developer',
                completedTrainings: ['T124 react for beginner', 'T156 javascript fundamentals', 'T232 aws cloud architect for beginner']
            }
        ];

        try {
            // Clear existing users
            await User.deleteMany({});
            console.log('🗑Cleared existing users');

            // Insert new users
            const createdUsers = await User.insertMany(users);
            console.log(`Created ${createdUsers.length} users`);

            // Display created users
            createdUsers.forEach(user => {
                console.log(`   - ${user.name} (${user.department} - ${user.title})`);
            });

        } catch (error) {
            console.error('Error seeding users:', error);
            throw error;
        }
    }

    // Seed trainings data
    async seedTrainings(): Promise<void> {
        console.log('Seeding trainings data...');

        const trainings = [
            {
                title: 'reactjs advanced level',
                description: 'Dive deep into the advanced concepts of ReactJS and elevate your skills to build scalable, performant, and enterprise-grade web applications. This course is designed for experienced developers who already have a solid foundation in React basics and want to tackle complex challenges in state management, optimization, testing, and integration with modern tools. Through hands-on projects, real-world case studies, and best practices, you\'ll learn to architect robust React applications that handle large-scale data, user interactions, and seamless user experiences.',
                duration: '3 hours',
                targetAudience: ['engineer', 'developer', 'technical support'],
                prerequisites: ['T124 react for beginner'],
                trainingType: 'technical'
            },
            {
                title: 'aws cloud architect for beginner',
                description: 'Get started with AWS cloud services and learn the fundamentals of cloud architecture. This course covers core AWS services, security best practices, and basic infrastructure design principles. Perfect for beginners looking to understand cloud computing and start their journey in cloud architecture.',
                duration: '4 hours',
                targetAudience: ['engineer', 'developer', 'technical support', 'IT administrator'],
                prerequisites: [],
                trainingType: 'technical'
            },
            {
                title: 'react for beginner',
                description: 'Learn the fundamentals of ReactJS including components, props, state, and hooks. This beginner-friendly course will guide you through building your first React application with hands-on exercises and practical examples.',
                duration: '2 hours',
                targetAudience: ['engineer', 'developer', 'technical support', 'student'],
                prerequisites: [],
                trainingType: 'technical'
            },
            {
                title: 'javascript fundamentals',
                description: 'Master the core concepts of JavaScript programming including variables, functions, objects, arrays, and ES6+ features. Essential for anyone pursuing web development careers.',
                duration: '3 hours',
                targetAudience: ['engineer', 'developer', 'technical support', 'student'],
                prerequisites: [],
                trainingType: 'technical'
            },
            {
                title: 'agile methodology',
                description: 'Learn Agile principles, Scrum framework, and Kanban practices to improve team collaboration and project delivery. This course covers sprint planning, daily standups, retrospectives, and product backlog management.',
                duration: '2.5 hours',
                targetAudience: ['product manager', 'engineer', 'team lead', 'project manager'],
                prerequisites: [],
                trainingType: 'methodology'
            },
            {
                title: 'product discovery',
                description: 'Master the techniques for identifying customer needs, validating product ideas, and defining product requirements. Learn how to conduct user research, create prototypes, and make data-driven product decisions.',
                duration: '3 hours',
                targetAudience: ['product manager', 'sales engineer', 'business analyst', 'UX designer'],
                prerequisites: [],
                trainingType: 'business'
            },
            {
                title: 'docker & kubernetes',
                description: 'Learn containerization with Docker and orchestration with Kubernetes. This course covers container basics, Dockerfile creation, Kubernetes pods, services, deployments, and scaling applications in production environments.',
                duration: '4 hours',
                targetAudience: ['devops engineer', 'backend engineer', 'system administrator'],
                prerequisites: [],
                trainingType: 'technical'
            },
            {
                title: 'presentation skills',
                description: 'Develop confident presentation skills for technical and business audiences. Learn storytelling techniques, slide design principles, and delivery methods that engage and persuade your audience.',
                duration: '2 hours',
                targetAudience: ['sales engineer', 'product manager', 'team lead', 'all employees'],
                prerequisites: [],
                trainingType: 'soft skills'
            }
        ];

        try {
            // Clear existing trainings
            await Training.deleteMany({});
            console.log('Cleared existing trainings');

            // Insert new trainings
            const createdTrainings = await Training.insertMany(trainings);
            console.log(`Created ${createdTrainings.length} trainings`);

            // Display created trainings
            createdTrainings.forEach(training => {
                console.log(`   - ${training.title} (${training.trainingType})`);
            });

            // Index trainings for vector search
            console.log('Indexing trainings for vector search...');
            await this.vectorStoreService.indexAllTrainings();

        } catch (error) {
            console.error('Error seeding trainings:', error);
            throw error;
        }
    }

    // Seed projects data
    async seedProjects(): Promise<void> {
        console.log('Seeding projects data...');

        const projects = [
            {
                name: 'Multi-Tenant SaaS Analytics Platform',
                description: 'A multi-tenant analytics dashboard where users see only their project data, with team invites and permissions.',
                keyFeatures: [
                    "Tenant isolation via URL subdomain (app.project.com)",
                    "RBAC (Owner, Editor, Viewer) using React Context + Middleware",
                    "Real-time event streaming (clicks, pageviews)",
                    "React Query with tenant-scoped cache",
                    "Export data as CSV",
                    "Deployed with Vercel Edge Middleware"
                ],
                companyContext: 'Vercel serves real-time analytics to 100K+ sites. Data must be isolated per tenant, with role-based access.',
                IndustryCase: ['Vercel Analytics', 'PostHog'],
                technologies: ['Next.js 14 (App Router)', 'TypeScript', 'Prisma', 'PostgreSQL', 'React Query', 'Clerk Auth', 'Vercel'],
                IndustrySkill: ['Multi-tenancy', 'SaaS architecture', 'secure data isolation'],
            },
            {
                name: 'AI-Powered Customer Support Chatbot',
                description: 'An intelligent chatbot system that provides instant customer support using natural language processing and machine learning.',
                keyFeatures: [
                    "Natural language understanding with GPT integration",
                    "Multi-channel support (web, mobile, social media)",
                    "Sentiment analysis for customer satisfaction",
                    "Automated ticket creation and routing",
                    "Knowledge base integration",
                    "Real-time analytics dashboard"
                ],
                companyContext: 'Improve customer support efficiency by 40% while maintaining high customer satisfaction scores.',
                IndustryCase: ['Intercom', 'Zendesk'],
                technologies: ['Node.js', 'Python', 'React', 'MongoDB', 'Redis', 'Docker', 'AWS Lambda'],
                IndustrySkill: ['AI/ML integration', 'real-time systems', 'scalable architecture'],
            },
            {
                name: 'Microservices E-commerce Platform',
                description: 'A scalable e-commerce platform built with microservices architecture to handle high traffic and complex business logic.',
                keyFeatures: [
                    "Domain-driven design architecture",
                    "Event-driven communication between services",
                    "Kubernetes orchestration",
                    "CI/CD pipeline with automated testing",
                    "Payment gateway integration",
                    "Inventory management system"
                ],
                companyContext: 'Support Black Friday traffic spikes with 99.99% uptime and sub-second response times.',
                IndustryCase: ['Amazon', 'Shopify'],
                technologies: ['Java/Spring Boot', 'Node.js', 'React', 'Kafka', 'Kubernetes', 'PostgreSQL', 'Redis'],
                IndustrySkill: ['microservices', 'event-driven architecture', 'cloud native development'],
            },
            {
                name: 'Real-time Collaboration Tool',
                description: 'A web-based collaboration platform that enables real-time document editing, video conferencing, and team communication.',
                keyFeatures: [
                    "Real-time collaborative document editing",
                    "WebRTC video and audio conferencing",
                    "Team channels and direct messaging",
                    "File sharing and version control",
                    "Screen sharing and annotations",
                    "Mobile applications"
                ],
                companyContext: 'Enable remote teams to collaborate effectively with enterprise-grade security and performance.',
                IndustryCase: ['Figma', 'Miro', 'Notion'],
                technologies: ['React', 'Node.js', 'WebRTC', 'WebSocket', 'MongoDB', 'Redis', 'AWS'],
                IndustrySkill: ['real-time communication', 'WebRTC', 'collaborative editing'],
            },
            {
                name: 'Data Analytics Pipeline',
                description: 'A comprehensive data processing pipeline that collects, processes, and visualizes business metrics from multiple sources.',
                keyFeatures: [
                    "Data ingestion from multiple sources (APIs, databases, files)",
                    "ETL processes with data validation",
                    "Real-time streaming with Apache Kafka",
                    "Data warehouse integration",
                    "Interactive dashboards and reporting",
                    "Automated data quality monitoring"
                ],
                companyContext: 'Provide business intelligence insights to stakeholders across the organization with near real-time data.',
                IndustryCase: ['Snowflake', 'Tableau', 'Looker'],
                technologies: ['Python', 'Apache Kafka', 'Apache Spark', 'Airflow', 'Snowflake', 'React', 'D3.js'],
                IndustrySkill: ['data engineering', 'ETL processes', 'business intelligence'],
            }
        ];

        try {
            // Clear existing projects
            await Project.deleteMany({});
            console.log('Cleared existing projects');

            // Insert new projects
            const createdProjects = await Project.insertMany(projects);
            console.log(`Created ${createdProjects.length} projects`);

            // Display created projects
            createdProjects.forEach(project => {
                console.log(`   - ${project.name}`);
            });

            // Index projects for vector search
            console.log('Indexing projects for vector search...');
            await this.vectorStoreService.indexAllProjects();

        } catch (error) {
            console.error('Error seeding projects:', error);
            throw error;
        }
    }

    // Seed all data
    async seedAll(): Promise<void> {
        try {
            console.log('Starting data seeding process...\n');

            await this.seedUsers();
            console.log(); // Empty line for readability

            await this.seedTrainings();
            console.log(); // Empty line for readability

            await this.seedProjects();
            console.log(); // Empty line for readability

            console.log('All data seeded successfully!');

        } catch (error) {
            console.error('Error during data seeding:', error);
            throw error;
        }
    }

    // Clear all data
    async clearAll(): Promise<void> {
        try {
            console.log('Clearing all data...');

            await User.deleteMany({});
            await Training.deleteMany({});
            await Project.deleteMany({});

            console.log('All data cleared successfully!');
        } catch (error) {
            console.error(' Error clearing data:', error);
            throw error;
        }
    }
}

// CLI interface
async function main() {
    const seeder = new DataSeeder();
    const command = process.argv[2];

    try {
        await connectDB();

        switch (command) {
            case 'seed':
                await seeder.seedAll();
                break;
            case 'clear':
                await seeder.clearAll();
                break;
            case 'seed-users':
                await seeder.seedUsers();
                break;
            case 'seed-trainings':
                await seeder.seedTrainings();
                break;
            case 'seed-projects':
                await seeder.seedProjects();
                break;
            default:
                console.log(`
Usage: npx ts-node seedData.ts <command>

Commands:
  seed          Seed all data (users, trainings, projects)
  clear         Clear all data
  seed-users    Seed only users data
  seed-trainings Seed only trainings data
  seed-projects Seed only projects data

Examples:
  npx ts-node seedData.ts seed
  npx ts-node seedData.ts clear
  npx ts-node seedData.ts seed-users
                `);
                break;
        }

    } catch (error) {
        console.error('❌ Script execution failed:', error);
        process.exit(1);
    } finally {
        await disconnectDB();
        process.exit(0);
    }
}

// Run the script if executed directly
if (require.main === module) {
    main();
}

export { DataSeeder };