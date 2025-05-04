'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import VideoPlayer from '@/components/lms/VideoPlayer'
import LessonContent from '@/components/lms/LessonContent'
import ProgressTracker from '@/components/lms/ProgressTracker'
import AiTutorChat from '@/components/lms/AiTutorChat'

// Define module and course types to fix TypeScript errors
type LessonType = {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'quiz';
  isCompleted: boolean;
};

type ModuleType = {
  id: string;
  title: string;
  lessons: LessonType[];
};

// Sample course data
const courseData: {
  id: string;
  title: string;
  instructor: string;
  modules: ModuleType[];
} = {
  id: '1',
  title: 'Little Red Riding Hood: Analysis & Interpretation',
  instructor: 'Little Red',
  modules: [
    {
      id: 'module-1',
      title: 'Origins and Historical Context',
      lessons: [
        { 
          id: 'lesson-1-1', 
          title: 'The Oral Tradition of Fairy Tales', 
          duration: '15 min',
          type: 'video',
          isCompleted: true
        },
        { 
          id: 'lesson-1-2', 
          title: 'Early Written Versions: Perrault and the Brothers Grimm', 
          duration: '20 min',
          type: 'video',
          isCompleted: true
        },
        { 
          id: 'lesson-1-3', 
          title: 'Historical and Social Context', 
          duration: '25 min',
          type: 'text',
          isCompleted: false
        },
        { 
          id: 'lesson-1-4', 
          title: 'Evolution of the Tale Through Time', 
          duration: '30 min',
          type: 'video',
          isCompleted: false
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Symbolism and Interpretation',
      lessons: [
        { 
          id: 'lesson-2-1', 
          title: 'The Red Hood/Cap: Color Symbolism', 
          duration: '20 min',
          type: 'video',
          isCompleted: false
        },
        { 
          id: 'lesson-2-2', 
          title: 'The Wolf: Predator Symbolism', 
          duration: '25 min',
          type: 'text',
          isCompleted: false
        },
        { 
          id: 'lesson-2-3', 
          title: 'The Forest: Setting as Symbol', 
          duration: '20 min',
          type: 'video',
          isCompleted: false
        },
        { 
          id: 'lesson-2-4', 
          title: 'The Journey: Coming of Age Metaphor', 
          duration: '30 min',
          type: 'video',
          isCompleted: false
        },
        { 
          id: 'lesson-2-5', 
          title: 'Guided Analysis Exercise', 
          duration: '45 min',
          type: 'quiz',
          isCompleted: false
        }
      ]
    },
    {
      id: 'module-3',
      title: 'Cultural Variations and Adaptations',
      lessons: [
        { 
          id: 'lesson-3-1', 
          title: 'European Variations', 
          duration: '25 min',
          type: 'video',
          isCompleted: false
        },
        { 
          id: 'lesson-3-2', 
          title: 'Asian Adaptations and Similar Tales', 
          duration: '30 min',
          type: 'text',
          isCompleted: false
        },
        { 
          id: 'lesson-3-3', 
          title: 'African and Middle Eastern Parallels', 
          duration: '25 min',
          type: 'video',
          isCompleted: false
        },
        { 
          id: 'lesson-3-4', 
          title: 'Modern Retellings in Literature', 
          duration: '35 min',
          type: 'text',
          isCompleted: false
        },
        { 
          id: 'lesson-3-5', 
          title: 'Film and Media Adaptations', 
          duration: '40 min',
          type: 'video',
          isCompleted: false
        }
      ]
    }
  ]
} as const;

// Sample lesson data
const lessonData = {
  id: 'lesson-1-3',
  title: 'Historical and Social Context',
  type: 'text',
  content: `
    <h2>Historical and Social Context of Little Red Riding Hood</h2>
    
    <p>The tale of Little Red Riding Hood emerged during a time of significant social and cultural change in Europe. Understanding the historical context helps us appreciate the deeper meanings and evolution of this enduring story.</p>
    
    <h3>17th Century France: Charles Perrault's Version</h3>
    
    <p>When Charles Perrault published his version of Little Red Riding Hood (Le Petit Chaperon Rouge) in 1697, France was under the rule of Louis XIV. This was a period characterized by:</p>
    
    <ul>
      <li>Strict social hierarchies and court etiquette</li>
      <li>Growing concerns about moral education, particularly for young women</li>
      <li>Increasing literacy among the upper classes</li>
      <li>A fascination with folklore and oral traditions</li>
    </ul>
    
    <p>Perrault's version was explicitly crafted as a moral tale for children, particularly young girls. It warned about the dangers of talking to strangers and the consequences of straying from the proper path. The story reflected societal concerns about young women's virtue and the importance of proper behavior.</p>
    
    <h3>19th Century Germany: The Brothers Grimm Version</h3>
    
    <p>When Jacob and Wilhelm Grimm included their version of Little Red Riding Hood in their collection "Children's and Household Tales" (1812), Germany was experiencing:</p>
    
    <ul>
      <li>The aftermath of the Napoleonic Wars</li>
      <li>A growing sense of German national identity</li>
      <li>Romanticism, with its emphasis on folklore and national traditions</li>
      <li>Industrialization and changing rural lifestyles</li>
    </ul>
    
    <p>The Grimms' version, which includes the rescue of Little Red Riding Hood and her grandmother by a huntsman, reflects different social values. It emphasizes redemption and protection, with the male huntsman figure representing societal order and security.</p>
    
    <h3>Social Significance</h3>
    
    <p>Across its various versions, Little Red Riding Hood has consistently addressed several social themes:</p>
    
    <ol>
      <li><strong>Coming of Age:</strong> The story often functions as a cautionary tale about the transition from childhood to adulthood, particularly for young women.</li>
      <li><strong>Gender Roles:</strong> The tale reflects and sometimes challenges societal expectations about female behavior and vulnerability.</li>
      <li><strong>Rural vs. Urban:</strong> The forest setting often represents the unknown dangers outside of civilized society.</li>
      <li><strong>Obedience and Authority:</strong> The consequences of disobeying parental (particularly maternal) instructions are central to most versions.</li>
    </ol>
    
    <p>As you analyze the tale, consider how these social contexts influenced the storytellers and how the tale itself might have influenced society in turn. The endurance of Little Red Riding Hood speaks to its ability to adapt to changing social concerns while maintaining its core elements.</p>
    
    <div class="ai-tutor-note">
      <h4>AI Tutor Note:</h4>
      <p>Consider how the historical context of each version might have influenced the specific details included or omitted. For example, why might Perrault's version end with the wolf consuming Little Red Riding Hood, while the Grimms' version includes a rescue? How do these different endings reflect the values and concerns of their respective societies?</p>
    </div>
  `,
  isCompleted: false
} as const;

export default function LearnPage() {
  const [overallProgress, setOverallProgress] = useState(12); // Percentage
  
  const handleMarkComplete = () => {
    // In a real app, this would update the database
    setOverallProgress(overallProgress + 4);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-grow">
        <div className="container-custom py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Area */}
            <div className="w-full lg:w-2/3">
              <div className="mb-6">
                <Link href={`/courses/${courseData.id}`} className="text-primary flex items-center mb-4">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Course Overview
                </Link>
                <h1 className="text-2xl font-bold mb-2">{courseData.title}</h1>
                <p className="text-muted-foreground">AI Tutor: {courseData.instructor}</p>
              </div>
              
              {/* Lesson Content */}
              <LessonContent
                lessonId={lessonData.id}
                courseId={courseData.id}
                title={lessonData.title}
                type={lessonData.type}
                content={lessonData.content}
                isCompleted={lessonData.isCompleted}
                onComplete={handleMarkComplete}
              />
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3">
              <div className="sticky top-8 space-y-6">
                {/* Progress Tracker */}
                <ProgressTracker
                  courseId={courseData.id}
                  courseName={courseData.title}
                  modules={courseData.modules}
                  overallProgress={overallProgress}
                />
                
                {/* AI Tutor */}
                <AiTutorChat chatId={`${courseData.id}-${lessonData.id}`} />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
