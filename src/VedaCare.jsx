import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, DoughnutController, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, DoughnutController, ArcElement);

// --- STYLES OBJECT --- //
const palette = {
  primary: '#065f46', // Emerald-900
  primaryHover: '#064e3b', // Emerald-950
  secondary: '#a7f3d0', // Emerald-200
  accent: '#10b981', // Emerald-500
  accentHover: '#059669', // Emerald-600
  textPrimary: '#1f2937', // Slate-800
  textSecondary: '#475569', // Slate-600
  bgLight: '#f0fdf4', // Green-50
  bgWhite: '#ffffff',
  border: '#e5e7eb', // Slate-200
  danger: '#ef4444',
  warning: '#f59e0b',
  star: '#facc15', // Amber-400
  footerBg: '#022c22', // Darker Green for footer
  footerText: '#a3b3c4', // Lighter text for footer
};

const styles = {
  appContainer: { backgroundColor: palette.bgLight, minHeight: '100vh', fontFamily: '"Inter", sans-serif', color: palette.textPrimary, transition: 'background-color 0.3s', display: 'flex', flexDirection: 'column' },
  mainContent: { flex: '1 1 auto', maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', width: '100%' },
  header: { backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 40, borderBottom: `1px solid ${palette.border}` },
  headerContent: { maxWidth: '1400px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLogo: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerTitle: { fontSize: '1.75rem', fontWeight: 'bold', color: palette.primary },
  navContainer: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: palette.bgLight, padding: '8px', borderRadius: '999px' },
  card: { backgroundColor: palette.bgWhite, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '24px', border: `1px solid ${palette.border}`, transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' },
  modalOverlay: { position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' },
  modalContent: { backgroundColor: palette.bgWhite, borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '32px', width: '100%', maxWidth: '512px', margin: '16px', animation: 'fadeInUp 0.3s ease-out' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  modalTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: palette.textPrimary },
  modalCloseButton: { color: palette.textSecondary, fontSize: '2rem', border: 'none', background: 'none', cursor: 'pointer' },
  button: { fontWeight: '600', padding: '12px 24px', borderRadius: '999px', transition: 'all 0.2s', border: 'none', cursor: 'pointer' },
  input: { width: '100%', padding: '12px', border: `1px solid ${palette.border}`, borderRadius: '8px', transition: 'border-color 0.2s, box-shadow 0.2s', outline: 'none' },
  select: { marginTop: '4px', display: 'block', width: '100%', padding: '10px 12px', border: `1px solid ${palette.border}`, borderRadius: '8px', outline: 'none', backgroundColor: palette.bgWhite },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: palette.textSecondary },
  grid: { display: 'grid', gap: '24px' },
  text3xl: { fontSize: '2rem', fontWeight: 'bold', color: palette.textPrimary },
  text2xl: { fontSize: '1.5rem', fontWeight: 'bold', color: palette.textPrimary },
  mb4: { marginBottom: '1rem' },
  mb6: { marginBottom: '1.5rem' },
};

// --- MOCK DATA --- //
const doctorProfile = {
  name: 'Dr. Anjali Verma',
  specialization: 'Panchakarma Specialist',
  bio: 'Dr. Anjali Verma is a dedicated Ayurvedic practitioner with over 15 years of experience in holistic healing and Panchakarma therapy. She is committed to providing personalized care and empowering her patients to achieve optimal health and well-being through traditional Ayurvedic wisdom combined with modern diagnostic approaches.',
  education: [
    { degree: 'B.A.M.S.', institution: 'All India Institute of Ayurveda (AIIA), Delhi', year: '2008' },
    { degree: 'M.D. (Panchakarma)', institution: 'Banaras Hindu University, Varanasi', year: '2011' },
  ],
  experience: [
    { role: 'Senior Consultant', clinic: 'AyurHeal Wellness Center, Pune', duration: '2015 - Present' },
    { role: 'Panchakarma Specialist', clinic: 'Kerala Ayurveda Ltd, Aluva', duration: '2011 - 2015' },
  ],
  awards: [
    { name: 'Charaka Award for Excellence in Ayurvedic Practice', year: '2023' },
    { name: 'Young Achiever in Ayurveda', year: '2018' },
  ],
  publications: [
    { title: '"The Efficacy of Vasti Karma in Lumbar Spondylosis"', journal: 'Journal of Ayurveda and Integrative Medicine', year: '2022' },
    { title: '"A Clinical Study on Nasya in the Management of Migraine"', journal: 'International Journal of Ayurvedic Medicine', year: '2019' },
  ],
  clinic: {
    name: 'Vedicure Clinic',
    address: '123 Wellness Lane, Koregaon Park, Pune, Maharashtra 411001',
    phone: '+91 98765 43210',
    hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
  },
};

const initialPatients = [
  { 
    id: 1, name: 'Aarav Sharma', condition: 'Chronic Back Pain', wellnessScore: 75, registered: '2025-08-01', 
    milestones: [{name: 'Reduced Morning Stiffness', completed: true}, {name: 'Improved Sleep Quality', completed: true}, {name: 'Pain-free for 24h', completed: false}],
    sessions: [
      { status: 'Past', therapyType: 'Kati Vasti', date: '2025-07-11', review: 'Initial consultation was thorough. The prescribed therapy seems promising.', rating: 4 },
      { status: 'Past', therapyType: 'Abhyanga', date: '2025-07-18', review: 'Very relaxing, but the back pain relief was temporary.', rating: 3 },
      { status: 'Past', therapyType: 'Pizhichil', date: '2025-08-05', review: 'Felt a noticeable improvement in flexibility after this session.', rating: 4 },
      { status: 'Past', therapyType: 'Kati Vasti', date: '2025-08-12', review: 'This was the best session so far. Significant pain reduction.', rating: 5 },
      { status: 'Past', therapyType: 'Abhyanga', date: '2025-09-12', review: 'Felt very relaxed, the pain was noticeably less for a few days.', rating: 5 },
      { status: 'Past', therapyType: 'Kati Vasti', date: '2025-09-19', review: 'Good session, targeted the lower back well.', rating: 4 },
      { status: 'Ongoing', therapyType: 'Pizhichil', date: '2025-09-26' },
      { status: 'Future', therapyType: 'Abhyanga', date: '2025-10-03' },
    ]
  },
  { 
    id: 2, name: 'Priya Patel', condition: 'Migraine', wellnessScore: 60, registered: '2025-08-15',
    milestones: [{name: 'Fewer than 2 migraines/week', completed: true}, {name: 'Reduced dependency on pain-killers', completed: false}],
    sessions: [
        { status: 'Past', therapyType: 'Consultation', date: '2025-07-20', review: 'Doctor was very understanding. Hopeful for the treatment.', rating: 5 },
        { status: 'Past', therapyType: 'Shirodhara', date: '2025-07-27', review: 'A unique experience. Felt a sense of calm during the therapy.', rating: 4 },
        { status: 'Past', therapyType: 'Nasya', date: '2025-08-10', review: 'This was a bit uncomfortable, but I had no migraine for a week after.', rating: 4 },
        { status: 'Past', therapyType: 'Shirodhara', date: '2025-08-17', review: 'Second session was even better. It is helping with the stress.', rating: 5 },
        { status: 'Past', therapyType: 'Shirodhara', date: '2025-09-12', review: 'The headache frequency has definitely decreased. Very calming experience.', rating: 5 },
        { status: 'Ongoing', therapyType: 'Shirodhara', date: '2025-09-26' },
        { status: 'Future', therapyType: 'Nasya', date: '2025-10-04' },
    ]
  },
  {
    id: 3, name: 'Rohan Desai', condition: 'Stress & Anxiety', wellnessScore: 68, registered: '2025-09-01',
    milestones: [{name: 'Reported better sleep', completed: true}, {name: 'Lowered daily stress levels', completed: false}],
    sessions: [
        { status: 'Past', therapyType: 'Abhyanga', date: '2025-08-25', review: 'The massage was incredibly relaxing and helped clear my mind.', rating: 5 },
        { status: 'Past', therapyType: 'Shirodhara', date: '2025-09-20', review: "Helped me relax, but the effect was short-lived.", rating: 3 },
        { status: 'Future', therapyType: 'Abhyanga', date: '2025-10-05' },
    ]
  },
  {
    id: 4, name: 'Sunita Nair', condition: 'Arthritis', wellnessScore: 82, registered: '2025-08-20',
    milestones: [{name: 'Increased joint mobility', completed: true}, {name: 'Reduced inflammation markers', completed: true}],
    sessions: [
        { status: 'Past', therapyType: 'Pizhichil', date: '2025-09-18', review: "Significant relief in joint stiffness. Very professional service.", rating: 4 },
        { status: 'Ongoing', therapyType: 'Kati Vasti', date: '2025-09-28' },
    ]
  },
  {
    id: 5, name: 'Vikram Mehta', condition: 'Insomnia', wellnessScore: 55, registered: '2025-09-05',
    milestones: [{name: 'Fell asleep faster', completed: false}, {name: 'Reduced nighttime awakenings', completed: false}],
    sessions: [
        { status: 'Past', therapyType: 'Abhyanga', date: '2025-09-22', review: "It was okay, but I didn't sleep much better that night.", rating: 3 },
        { status: 'Future', therapyType: 'Shirodhara', date: '2025-10-06' },
    ]
  }
];

const initialEvents = [
  { id: 1, title: 'Aarav Sharma - Pizhichil', therapyType: 'Pizhichil', start: new Date('2025-09-26T10:00:00'), end: new Date('2025-09-26T11:00:00'), patientId: 1, practitionerId: 1 },
  { id: 2, title: 'Priya Patel - Shirodhara', therapyType: 'Shirodhara', start: new Date('2025-09-26T12:00:00'), end: new Date('2025-09-26T13:00:00'), patientId: 2, practitionerId: 2 },
  { id: 3, title: 'Aarav Sharma - Abhyanga', therapyType: 'Abhyanga', start: new Date('2025-10-03T10:00:00'), end: new Date('2025-10-03T11:00:00'), patientId: 1, practitionerId: 1 },
  { id: 4, title: 'Priya Patel - Nasya', therapyType: 'Nasya', start: new Date('2025-10-04T11:00:00'), end: new Date('2025-10-04T12:00:00'), patientId: 2, practitionerId: 2 },
  { id: 5, title: 'Rohan Desai - Abhyanga', therapyType: 'Abhyanga', start: new Date('2025-10-05T14:00:00'), end: new Date('2025-10-05T15:00:00'), patientId: 3, practitionerId: 3 },
  { id: 6, title: 'Vikram Mehta - Shirodhara', therapyType: 'Shirodhara', start: new Date('2025-10-06T09:00:00'), end: new Date('2025-10-06T10:00:00'), patientId: 5, practitionerId: 1 },
  { id: 7, title: 'Sunita Nair - Kati Vasti', therapyType: 'Kati Vasti', start: new Date('2025-09-28T16:00:00'), end: new Date('2025-09-28T17:00:00'), patientId: 4, practitionerId: 2 }
];

const practitioners = [ { id: 1, name: 'Dr. Anjali Verma' }, { id: 2, name: 'Dr. Vikram Singh' }, { id: 3, name: 'Dr. Sunita Rao' } ];
const therapyTypes = ['Abhyanga', 'Shirodhara', 'Pizhichil', 'Kati Vasti', 'Nasya', 'Virechana', 'Consultation'];
const therapyStyles = {
    'Abhyanga': { backgroundColor: '#c7d2fe', border: '1px solid #a5b4fc', color: '#4338ca' },
    'Shirodhara': { backgroundColor: '#d8b4fe', border: '1px solid #c084fc', color: '#7e22ce' },
    'Pizhichil': { backgroundColor: '#a7f3d0', border: '1px solid #6ee7b7', color: '#047857' },
    'Kati Vasti': { backgroundColor: '#fde68a', border: '1px solid #fcd34d', color: '#b45309' },
    'Consultation': { backgroundColor: '#e5e7eb', border: '1px solid #9ca3af', color: '#1f2937' },
};

// --- Helper & Custom Components --- //
const Card = ({ children, style }) => <div style={{...styles.card, ...style}}>{children}</div>;
const Modal = ({ isOpen, onClose, title, children }) => { if (!isOpen) return null; return ( <div style={styles.modalOverlay}> <div style={styles.modalContent}> <div style={styles.modalHeader}> <h2 style={styles.modalTitle}>{title}</h2> <button onClick={onClose} style={styles.modalCloseButton}>&times;</button> </div> <div>{children}</div> </div> </div> ); };
const Button = ({ children, onClick, style, type = 'primary', disabled = false }) => { const [isHovered, setIsHovered] = useState(false); const baseStyle = { ...styles.button, ...style }; const typeStyles = { primary: { backgroundColor: palette.primary, color: palette.bgWhite }, primaryHover: { backgroundColor: palette.primaryHover, color: palette.bgWhite }, accent: { backgroundColor: palette.accent, color: palette.bgWhite }, accentHover: { backgroundColor: palette.accentHover, color: palette.bgWhite }, secondary: { backgroundColor: 'transparent', color: palette.primary, border: `2px solid ${palette.primary}` }, secondaryHover: { backgroundColor: palette.bgLight, color: palette.primary, border: `2px solid ${palette.primary}` }, }; const finalStyle = { ...baseStyle, ...(isHovered && !disabled ? typeStyles[`${type}Hover`] || typeStyles[type] : typeStyles[type]), opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }; return <button onClick={onClick} style={finalStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} disabled={disabled}>{children}</button>; };
const useWindowWidth = () => { const [windowWidth, setWindowWidth] = useState(window.innerWidth); useEffect(() => { const handleResize = () => setWindowWidth(window.innerWidth); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize); }, []); return windowWidth; };
const FullCalendar = ({ events, onSelectEvent }) => { const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 26)); const [view, setView] = useState('month'); const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); const header = () => ( <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}> <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}> <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} style={{padding: '8px', borderRadius: '0.375rem', border: 'none', background: 'none', cursor: 'pointer'}}>&lt;</button> <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: palette.textPrimary}}> {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} </h2> <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} style={{padding: '8px', borderRadius: '0.375rem', border: 'none', background: 'none', cursor: 'pointer'}}>&gt;</button> </div> </div> ); const renderMonthView = () => { const days = []; const startDate = new Date(startOfMonth); startDate.setDate(startDate.getDate() - startDate.getDay()); for (let i = 0; i < 42; i++) { days.push(new Date(startDate)); startDate.setDate(startDate.getDate() + 1); } return (<> <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 'bold', color: palette.textSecondary}}> {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} style={{padding: '8px 0'}}>{day}</div>)} </div> <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: `1px solid ${palette.border}`, borderLeft: `1px solid ${palette.border}`}}> {days.map(day => ( <div key={day.toISOString()} style={{height: '128px', padding: '4px', borderBottom: `1px solid ${palette.border}`, borderRight: `1px solid ${palette.border}`, overflowY: 'auto', backgroundColor: day.getMonth() !== currentDate.getMonth() ? palette.bgLight : 'white'}}> <p style={{fontSize: '0.875rem', color: new Date().toDateString() === day.toDateString() ? palette.accent : 'inherit', fontWeight: new Date().toDateString() === day.toDateString() ? 'bold' : 'normal'}}>{day.getDate()}</p> {events.filter(e => new Date(e.start).toDateString() === day.toDateString()).map(event => ( <div key={event.id} onClick={() => onSelectEvent(event)} style={{fontSize: '0.75rem', padding: '4px', borderRadius: '4px', margin: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', ...therapyStyles[event.therapyType]}}>{event.title}</div> ))} </div> ))} </div></>); }; return <div>{header()}{renderMonthView()}</div>; };
const StarRating = ({ rating }) => <div>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ color: i < rating ? palette.star : palette.border, fontSize: '1.25rem' }}>★</span>)}</div>;

// --- Chatbot Component --- //
const Chatbot = () => {
    const chatbotStyles = {
        container: {
            background: `linear-gradient(135deg, ${palette.primary}, ${palette.accent})`,
            color: palette.bgWhite,
            padding: '32px',
        },
        chatArea: {
            width: '100%',
        },
        chatHeader: {
            fontSize: '1.75rem',
            fontWeight: 'bold',
        },
        chatSubtitle: {
            opacity: 0.9,
            marginBottom: '16px',
        },
        chatWindow: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            height: '120px',
            marginBottom: '16px',
            overflowY: 'auto',
            fontSize: '0.875rem',
        },
        chatInputContainer: {
            display: 'flex',
            gap: '8px',
        },
        chatInput: {
            flexGrow: 1,
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            color: palette.textPrimary,
        },
        chatButton: {
            backgroundColor: palette.bgWhite,
            color: palette.primary,
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600'
        }
    };
    
    return (
        <Card style={chatbotStyles.container}>
            <div style={chatbotStyles.chatArea}>
                <h3 style={chatbotStyles.chatHeader}>Ask Vedic</h3>
                <p style={chatbotStyles.chatSubtitle}>Your 24/7 AI Health Assistant</p>
                <div style={chatbotStyles.chatWindow}>
                    <p><strong>Vedic:</strong> Hello! How can I assist you today? You can ask me about therapy details, patient history summaries, or general Ayurvedic knowledge.</p>
                </div>
                <div style={chatbotStyles.chatInputContainer}>
                    <input type="text" placeholder="Type your question..." style={chatbotStyles.chatInput} />
                    <button style={chatbotStyles.chatButton}>Send</button>
                </div>
            </div>
        </Card>
    );
};


// --- Footer Component --- //
const Footer = () => {
    const windowWidth = useWindowWidth();
    const isMd = windowWidth >= 768;

    const footerStyles = {
        container: {
            backgroundColor: palette.footerBg,
            color: palette.footerText,
            borderTop: `1px solid ${palette.primaryHover}`
        },
        content: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '48px 24px',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: isMd ? 'repeat(3, 1fr)' : '1fr',
            gap: '32px'
        },
        link: {
            color: palette.footerText,
            textDecoration: 'none',
            transition: 'color 0.2s',
        },
        linkHover: {
            color: palette.bgLight,
        },
        heading: {
            fontSize: '1.125rem',
            fontWeight: '600',
            color: palette.bgWhite,
            marginBottom: '16px'
        },
        bottomBar: {
            marginTop: '32px',
            paddingTop: '32px',
            borderTop: `1px solid ${palette.primaryHover}`,
            textAlign: 'center',
            fontSize: '0.875rem',
            color: palette.textSecondary
        }
    };

    const SocialIcon = ({ href, children }) => {
        const [isHovered, setIsHovered] = useState(false);
        return (
            <a href={href} style={{ color: isHovered ? palette.bgLight : palette.footerText, transition: 'color 0.2s' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                {children}
            </a>
        );
    };
    
    const FooterLink = ({ href, children }) => {
      const [isHovered, setIsHovered] = useState(false);
      return (
        <li>
          <a href={href} style={isHovered ? {...footerStyles.link, ...footerStyles.linkHover} : footerStyles.link} onMouseEnter={()=>setIsHovered(true)} onMouseLeave={()=>setIsHovered(false)}>
            {children}
          </a>
        </li>
      )
    };

    return (
        <footer style={footerStyles.container}>
            <div style={footerStyles.content}>
                <div style={footerStyles.grid}>
                    <div>
                        <div style={{...styles.headerLogo, marginBottom: '16px'}}>
                             <svg width="40" height="40" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M128 24C64 24 24 64 24 128C24 192 64 232 128 232C192 232 232 192 232 128C232 64 192 24 128 24ZM188 132C188 162.379 162.379 188 132 188C120.923 188 110.435 184.823 101.489 179.467C100.992 179.177 100.419 179.431 100.222 179.914C95.426 191.954 81.396 199.13 68 196.115C68.917 176.431 79.529 159.263 94.621 149.433C95.207 149.03 95.309 148.241 94.887 147.747C88.895 140.902 85.064 131.625 86.136 122.062C88.296 102.836 106.941 88 128 88C162.379 88 188 113.621 188 144V132Z" fill="url(#paint0_linear_footer)"/>
                                <defs><linearGradient id="paint0_linear_footer" x1="128" y1="24" x2="128" y2="232" gradientUnits="userSpaceOnUse"><stop stopColor={palette.bgLight} /><stop offset="1" stopColor={palette.footerText} /></linearGradient></defs>
                            </svg>
                            <h1 style={{...styles.headerTitle, color: palette.bgWhite, fontSize: '1.75rem'}}>Vedicure</h1>
                        </div>
                        <p>Holistic Health Management, Simplified.</p>
                    </div>
                    <div>
                        <h4 style={footerStyles.heading}>Quick Links</h4>
                        <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            <FooterLink href="#">About Us</FooterLink>
                            <FooterLink href="#">Services</FooterLink>
                            <FooterLink href="#">Privacy Policy</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h4 style={footerStyles.heading}>Follow Us</h4>
                        <div style={{display: 'flex', gap: '16px'}}>
                            <SocialIcon href="#">
                                <svg style={{height: '24px', width: '24px'}} fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                            </SocialIcon>
                            <SocialIcon href="#">
                                <svg style={{height: '24px', width: '24px'}} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.735 9.492.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z"></path></svg>
                            </SocialIcon>
                        </div>
                    </div>
                </div>
                <div style={footerStyles.bottomBar}>
                    <p>© 2025 Vedicure. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};


// --- Main App Component --- //
export default function App() {
  const [view, setView] = useState('dashboard');
  const [patients] = useState(initialPatients);
  const [events, setEvents] = useState(initialEvents);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const windowWidth = useWindowWidth();
  const [aiSummary, setAiSummary] = useState(''); const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false); const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [recordsSelectedPatient, setRecordsSelectedPatient] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Scheduler form state
  const [newApptPatient, setNewApptPatient] = useState('');
  const [newApptTherapy, setNewApptTherapy] = useState('');
  const [newApptPractitioner, setNewApptPractitioner] = useState('');
  const [newApptDate, setNewApptDate] = useState(new Date().toISOString().split('T')[0]);
  const [newApptTime, setNewApptTime] = useState('09:00');


  const callGeminiAPI = async (prompt) => { const apiKey = ""; const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`; try { const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }); if (!response.ok) throw new Error(`API call failed: ${response.status}`); const result = await response.json(); return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response."; } catch (error) { console.error("Gemini API error:", error); return "Error generating response."; } };
  const generatePatientSummary = async () => { if (!selectedPatient) return; setIsAiSummaryLoading(true); setAiSummary(''); const sessionText = selectedPatient.sessions.map(s => `On ${s.date}, a ${s.status} session of ${s.therapyType} occurred.${s.review ? ` Patient review: "${s.review}"` : ''}`).join('\n'); const prompt = `Generate a concise clinical summary for ${selectedPatient.name}, being treated for ${selectedPatient.condition}. Based on the following session history, summarize their progress:\n${sessionText}\n Keep it brief and professional.`; const summary = await callGeminiAPI(prompt); setAiSummary(summary); setIsAiSummaryLoading(false); };
  const handleSelectPatient = (patient) => { setSelectedPatient(patient); setAiSummary(''); setView('patientDetail'); };
  
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!newApptPatient || !newApptTherapy || !newApptPractitioner) {
        alert("Please fill all fields.");
        return;
    }
    const patient = patients.find(p => p.id === parseInt(newApptPatient));
    const start = new Date(`${newApptDate}T${newApptTime}:00`);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // Assume 1-hour sessions

    const newEvent = {
        id: events.length + 1,
        title: `${patient.name} - ${newApptTherapy}`,
        therapyType: newApptTherapy,
        start,
        end,
        patientId: patient.id,
        practitionerId: parseInt(newApptPractitioner),
    };
    setEvents([...events, newEvent]);
    // Reset form
    setNewApptPatient('');
    setNewApptTherapy('');
    setNewApptPractitioner('');
    setNewApptDate(new Date().toISOString().split('T')[0]);
    setNewApptTime('09:00');
  };

  const renderDashboard = () => {
    const isLg = windowWidth >= 1024;
    const therapyDistributionData = { labels: therapyTypes.slice(0, 5), datasets: [{ data: [12, 19, 8, 5, 6], backgroundColor: ['#c7d2fe', '#d8b4fe', '#a7f3d0', '#fde68a', '#fbcfe8'], borderColor: palette.bgWhite, borderWidth: 4, }], };
    const upcomingSessions = patients.flatMap(p => p.sessions.filter(s => s.status === 'Future').map(s => ({...s, patientName: p.name, patientId: p.id }))).sort((a,b) => new Date(a.date) - new Date(b.date));
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        <div style={{ padding: '48px 24px', borderRadius: '16px', background: `linear-gradient(to right, ${palette.secondary}, ${palette.primary})`, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{fontSize: '2.5rem', fontWeight: 'bold'}}>Welcome, Dr. Verma</h1>
                <p style={{fontSize: '1.125rem', opacity: 0.9}}>Here's your overview for today.</p>
            </div>
            <img src={`https://placehold.co/200x100/ffffff/065f46?text=Vedicure`} alt="Vedicure" style={{borderRadius: '8px'}}/>
        </div>
        <div style={{...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
            <Card style={{textAlign: 'center'}}><p style={{fontSize: '2rem', fontWeight: 'bold', color: palette.primary}}>{patients.length}</p><p style={styles.label}>Total Patients</p></Card>
            <Card style={{textAlign: 'center'}}><p style={{fontSize: '2rem', fontWeight: 'bold', color: palette.primary}}>{patients.flatMap(p => p.sessions.filter(s => s.status === 'Ongoing')).length}</p><p style={styles.label}>Ongoing Therapies</p></Card>
            <Card style={{textAlign: 'center'}}><p style={{fontSize: '2rem', fontWeight: 'bold', color: palette.primary}}>{upcomingSessions.length}</p><p style={styles.label}>Upcoming Sessions</p></Card>
        </div>
        <div style={{...styles.grid, gridTemplateColumns: isLg ? '2fr 1fr' : '1fr', gap: '24px'}}>
            <Card>
                <h2 style={{...styles.text2xl, ...styles.mb4}}>Upcoming Sessions</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    {upcomingSessions.slice(0, 4).map((s, i) => (
                        <div key={i} onClick={() => handleSelectPatient(patients.find(p=>p.id === s.patientId))} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', cursor: 'pointer', backgroundColor: i%2===0 ? palette.bgLight : 'transparent'}}>
                            <div><p style={{fontWeight: '600'}}>{s.patientName}</p><p style={{fontSize: '0.875rem', color: palette.textSecondary}}>{s.therapyType}</p></div>
                            <p style={{fontWeight: '500'}}>{new Date(s.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</p>
                        </div>
                    ))}
                </div>
            </Card>
            <Card>
                <h2 style={{...styles.text2xl, ...styles.mb4}}>Therapy Distribution</h2>
                <div style={{height: '250px'}}><Doughnut data={therapyDistributionData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }}/></div>
            </Card>
        </div>
        <Chatbot />
      </div>
    );
  };
  
  const renderPatientDetail = () => {
    if (!selectedPatient) return null;
    const wellnessChartData = { labels: selectedPatient.sessions.filter(s=>s.status==='Past').map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })), datasets: [{ label: 'Wellness Score Trend', data: [70, 75], borderColor: palette.primary, backgroundColor: 'rgba(6, 95, 70, 0.1)', tension: 0.4, fill: true }] };
    return (
        <div>
            <button onClick={() => setView('dashboard')} style={{...styles.button, backgroundColor: 'transparent', color: palette.textPrimary, width: 'auto', marginBottom: '24px', paddingLeft: '0'}}>&larr; Back to Dashboard</button>
            <div style={{...styles.grid, gridTemplateColumns: windowWidth >= 1024 ? '1fr 1fr' : '1fr', gap: '24px'}}>
                 <Card>
                     <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                         <div><h2 style={styles.text3xl}>{selectedPatient.name}</h2><p style={{color: palette.textSecondary}}>{selectedPatient.condition}</p></div>
                         <div style={{textAlign: 'right'}}><div style={{fontSize: '2.5rem', fontWeight: 'bold', color: palette.primary}}>{selectedPatient.wellnessScore}%</div><p style={{color: palette.textSecondary}}>Wellness Score</p></div>
                     </div>
                 </Card>
                 <Card>
                    <h3 style={{...styles.text2xl, ...styles.mb4}}>Recovery Milestones</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        {selectedPatient.milestones.map((m, i) => (
                            <div key={i} style={{display: 'flex', alignItems: 'center', gap: '12px', opacity: m.completed ? 1 : 0.7}}>
                                <div style={{width: '24px', height: '24px', borderRadius: '50%', backgroundColor: m.completed ? palette.accent : palette.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>✓</div>
                                <p style={{textDecoration: m.completed ? 'line-through' : 'none', color: m.completed ? palette.textSecondary : palette.textPrimary}}>{m.name}</p>
                            </div>
                        ))}
                    </div>
                 </Card>
            </div>
            <div style={{marginTop: '24px', ...styles.grid, gridTemplateColumns: '1fr', gap: '24px'}}>
                <Card><h3 style={{...styles.text2xl, ...styles.mb4}}>Wellness Trend</h3><Line data={wellnessChartData} options={{ responsive: true }} /></Card>
                <Card><h3 style={{...styles.text2xl, ...styles.mb4}}>✨ AI Patient Summary</h3><Button onClick={generatePatientSummary} disabled={isAiSummaryLoading} type="accent" style={{width: 'auto', position: 'absolute', top: '24px', right: '24px'}}>Generate</Button>{isAiSummaryLoading ? <p>Thinking...</p> : <p style={{whiteSpace: 'pre-wrap', color: palette.textSecondary, lineHeight: 1.6}}>{aiSummary || 'Click generate to get an AI summary based on session history.'}</p>}</Card>
                <Card>
                  <h3 style={{...styles.text2xl, ...styles.mb4}}>Session History</h3><Button onClick={() => setFeedbackModalOpen(true)} type="secondary" style={{width: 'auto', position: 'absolute', top: '24px', right: '24px'}}>+ Log Session</Button>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {selectedPatient.sessions.map((session, i) => (
                      <div key={i} style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${palette.border}`, backgroundColor: session.status === 'Past' ? palette.bgWhite : palette.bgLight }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div><p style={{fontWeight: '600'}}>{session.therapyType}</p><p style={{fontSize: '0.875rem', color: palette.textSecondary}}>{new Date(session.date).toDateString()}</p></div>
                            <span style={{padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', color: session.status === 'Past' ? palette.textSecondary : palette.primary, backgroundColor: session.status === 'Past' ? palette.border : palette.secondary}}>{session.status}</span>
                        </div>
                        {session.status === 'Past' && (
                          <div style={{marginTop: '12px', borderTop: `1px solid ${palette.border}`, paddingTop: '12px'}}>
                            <p style={{fontStyle: 'italic', color: palette.textSecondary}}>"{session.review}"</p>
                            <div style={{marginTop: '8px'}}><StarRating rating={session.rating} /></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
            </div>
        </div>
    );
  };
  
  const renderScheduler = () => {
    const today = new Date();
    const todaysEvents = events
        .filter(e => new Date(e.start).toDateString() === today.toDateString())
        .sort((a, b) => a.start - b.start);

    return (
        <div>
            <h2 style={{...styles.text3xl, ...styles.mb6}}>Scheduler</h2>
            <div style={{...styles.grid, gridTemplateColumns: windowWidth >= 1024 ? '1fr 2fr' : '1fr', alignItems: 'flex-start' }}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                    <Card>
                        <h3 style={{...styles.text2xl, marginBottom: '16px'}}>Schedule Appointment</h3>
                        <form onSubmit={handleScheduleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                             <div>
                                <label style={styles.label}>Patient</label>
                                <select style={styles.select} value={newApptPatient} onChange={e => setNewApptPatient(e.target.value)}><option value="">Select Patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                            </div>
                             <div>
                                <label style={styles.label}>Therapy Type</label>
                                <select style={styles.select} value={newApptTherapy} onChange={e => setNewApptTherapy(e.target.value)}><option value="">Select Therapy</option>{therapyTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                            </div>
                             <div>
                                <label style={styles.label}>Practitioner</label>
                                <select style={styles.select} value={newApptPractitioner} onChange={e => setNewApptPractitioner(e.target.value)}><option value="">Select Practitioner</option>{practitioners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                            </div>
                             <div>
                                <label style={styles.label}>Date</label>
                                <input type="date" style={{...styles.input, width: 'calc(100% - 26px)'}} value={newApptDate} onChange={e => setNewApptDate(e.target.value)} />
                            </div>
                            <div>
                                <label style={styles.label}>Time</label>
                                <input type="time" style={{...styles.input, width: 'calc(100% - 26px)'}} value={newApptTime} onChange={e => setNewApptTime(e.target.value)} />
                            </div>
                            <Button type="primary" style={{width: '100%', marginTop: '8px'}}>Schedule</Button>
                        </form>
                    </Card>
                    <Card>
                        <h3 style={{...styles.text2xl, marginBottom: '16px'}}>Today's Appointments</h3>
                        <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                            {todaysEvents.length > 0 ? todaysEvents.map(event => (
                                <div key={event.id} style={{padding: '8px', borderBottom: `1px solid ${palette.border}`}}>
                                    <p style={{fontWeight: '600'}}>{event.title}</p>
                                    <p style={{fontSize: '0.875rem', color: palette.textSecondary}}>{new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            )) : <p>No appointments scheduled for today.</p>}
                        </div>
                    </Card>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                    <Card><FullCalendar events={events} onSelectEvent={(e) => setSelectedEvent(e)} /></Card>
                    {selectedEvent && (
                        <Card>
                            <h3 style={{...styles.text2xl, marginBottom: '16px'}}>Appointment Details</h3>
                            <p><strong style={{color: palette.primary}}>Patient:</strong> {patients.find(p => p.id === selectedEvent.patientId)?.name}</p>
                            <p><strong style={{color: palette.primary}}>Therapy:</strong> {selectedEvent.therapyType}</p>
                            <p><strong style={{color: palette.primary}}>Time:</strong> {new Date(selectedEvent.start).toLocaleString()}</p>
                            <p><strong style={{color: palette.primary}}>Practitioner:</strong> {practitioners.find(p => p.id === selectedEvent.practitionerId)?.name}</p>
                            <div style={{marginTop: '16px', display: 'flex', gap: '8px'}}>
                                <Button type="secondary" style={{width: '100%'}}>Reschedule</Button>
                                <Button style={{width: '100%', backgroundColor: palette.danger, color: palette.bgWhite}}>Cancel</Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

  const renderRecords = () => {
    const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
        <div>
            <h2 style={{...styles.text3xl, ...styles.mb6}}>Patient Records</h2>
            <div style={{...styles.grid, gridTemplateColumns: windowWidth >= 1024 ? '1fr 2fr' : '1fr', alignItems: 'flex-start' }}>
                <Card>
                    <input 
                        type="text" 
                        placeholder="Search patients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{...styles.input, marginBottom: '16px', width: 'calc(100% - 24px)'}}
                    />
                    <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
                        {filteredPatients.map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => setRecordsSelectedPatient(p)}
                                style={{
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer',
                                    marginBottom: '8px',
                                    backgroundColor: recordsSelectedPatient?.id === p.id ? palette.secondary : 'transparent',
                                    border: `1px solid ${recordsSelectedPatient?.id === p.id ? palette.primary : 'transparent'}`
                                }}
                            >
                                <p style={{fontWeight: '600'}}>{p.name}</p>
                                <p style={{fontSize: '0.875rem', color: palette.textSecondary}}>{p.condition}</p>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card>
                    {recordsSelectedPatient ? (
                        <div>
                            <h3 style={{...styles.text2xl, ...styles.mb4}}>Session Feedback from {recordsSelectedPatient.name}</h3>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '65vh', overflowY: 'auto'}}>
                                {recordsSelectedPatient.sessions.filter(s => s.status === 'Past').map((session, i) => (
                                    <div key={i} style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${palette.border}`}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <div>
                                                <p style={{fontWeight: '600'}}>{session.therapyType}</p>
                                                <p style={{fontSize: '0.875rem', color: palette.textSecondary}}>{new Date(session.date).toDateString()}</p>
                                            </div>
                                            <StarRating rating={session.rating} />
                                        </div>
                                        <p style={{fontStyle: 'italic', color: palette.textSecondary, marginTop: '12px'}}>"{session.review}"</p>
                                    </div>
                                ))}
                                {recordsSelectedPatient.sessions.filter(s => s.status === 'Past').length === 0 && <p>No past sessions found for this patient.</p>}
                            </div>
                        </div>
                    ) : (
                        <div style={{textAlign: 'center', padding: '48px'}}>
                            <p style={{fontSize: '1.25rem', color: palette.textSecondary}}>Select a patient to view their records.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
  };
  
  const renderProfile = () => {
    const { name, specialization, bio, education, experience, awards, publications, clinic } = doctorProfile;
    const isLg = windowWidth >= 1024;

    const ProfileSection = ({ title, children }) => (
      <div>
        <h3 style={{...styles.text2xl, fontSize: '1.25rem', color: palette.primary, borderBottom: `2px solid ${palette.secondary}`, paddingBottom: '8px', marginBottom: '16px'}}>{title}</h3>
        {children}
      </div>
    );
    
    return (
      <div>
        <h2 style={{...styles.text3xl, ...styles.mb6}}>Doctor Profile</h2>
        <div style={{...styles.grid, gridTemplateColumns: isLg ? '1fr 2fr' : '1fr', alignItems: 'flex-start' }}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <Card style={{textAlign: 'center'}}>
              <img src="https://placehold.co/128x128/a7f3d0/065f46?text=AV" alt="Dr. Anjali Verma" style={{width: '128px', height: '128px', borderRadius: '50%', margin: '0 auto 16px', border: `4px solid ${palette.bgWhite}`, boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
              <h2 style={styles.text2xl}>{name}</h2>
              <p style={{color: palette.accent, fontWeight: '600'}}>{specialization}</p>
            </Card>
            <Card>
              <ProfileSection title="Clinic Details">
                <p style={{fontWeight: '600', color: palette.textPrimary}}>{clinic.name}</p>
                <p style={{color: palette.textSecondary}}>{clinic.address}</p>
                <p style={{color: palette.textSecondary, marginTop: '8px'}}><span style={{fontWeight: '600'}}>Phone:</span> {clinic.phone}</p>
                <p style={{color: palette.textSecondary}}><span style={{fontWeight: '600'}}>Hours:</span> {clinic.hours}</p>
              </ProfileSection>
            </Card>
          </div>
          <Card>
            <ProfileSection title="About">
              <p style={{lineHeight: 1.6, color: palette.textSecondary}}>{bio}</p>
            </ProfileSection>
            <div style={{marginTop: '24px'}}>
              <ProfileSection title="Professional Background">
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  <div>
                    <h4 style={{fontWeight: '600', marginBottom: '8px'}}>Education</h4>
                    <ul style={{listStylePosition: 'inside', paddingLeft: '4px'}}>
                      {education.map((edu, i) => <li key={i} style={{color: palette.textSecondary}}>{edu.degree}, {edu.institution} ({edu.year})</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{fontWeight: '600', marginBottom: '8px'}}>Experience</h4>
                    <ul style={{listStylePosition: 'inside', paddingLeft: '4px'}}>
                      {experience.map((exp, i) => <li key={i} style={{color: palette.textSecondary}}>{exp.role} at {exp.clinic} ({exp.duration})</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{fontWeight: '600', marginBottom: '8px'}}>Awards</h4>
                    <ul style={{listStylePosition: 'inside', paddingLeft: '4px'}}>
                      {awards.map((award, i) => <li key={i} style={{color: palette.textSecondary}}>{award.name} ({award.year})</li>)}
                    </ul>
                  </div>
                   <div>
                    <h4 style={{fontWeight: '600', marginBottom: '8px'}}>Publications</h4>
                    <ul style={{listStylePosition: 'inside', paddingLeft: '4px'}}>
                      {publications.map((pub, i) => <li key={i} style={{color: palette.textSecondary}}>"{pub.title}" - <i>{pub.journal}</i>, {pub.year}</li>)}
                    </ul>
                  </div>
                </div>
              </ProfileSection>
            </div>
          </Card>
        </div>
      </div>
    );
  };
  
  const renderContent = () => { switch (view) { case 'dashboard': return renderDashboard(); case 'scheduler': return renderScheduler(); case 'records': return renderRecords(); case 'profile': return renderProfile(); case 'patientDetail': return renderPatientDetail(); default: return renderDashboard(); } };
  const NavLink = ({ children, viewName }) => { const linkStyle = {padding: '8px 20px', borderRadius: '999px', fontWeight: '600', transition: 'all 0.2s', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }; const activeStyle = { backgroundColor: palette.primary, color: palette.bgWhite }; const inactiveStyle = { backgroundColor: 'transparent', color: palette.primary }; return (<button onClick={() => setView(viewName)} style={{...linkStyle, ...(view === viewName ? activeStyle : inactiveStyle)}}>{children}</button>); };

  return (
    <div style={styles.appContainer}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLogo}>
            <svg width="40" height="40" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M128 24C64 24 24 64 24 128C24 192 64 232 128 232C192 232 232 192 232 128C232 64 192 24 128 24ZM188 132C188 162.379 162.379 188 132 188C120.923 188 110.435 184.823 101.489 179.467C100.992 179.177 100.419 179.431 100.222 179.914C95.426 191.954 81.396 199.13 68 196.115C68.917 176.431 79.529 159.263 94.621 149.433C95.207 149.03 95.309 148.241 94.887 147.747C88.895 140.902 85.064 131.625 86.136 122.062C88.296 102.836 106.941 88 128 88C162.379 88 188 113.621 188 144V132Z" fill="url(#paint0_linear_header)"/>
                <defs><linearGradient id="paint0_linear_header" x1="128" y1="24" x2="128" y2="232" gradientUnits="userSpaceOnUse"><stop stopColor="#A7F3D0"/><stop offset="1" stopColor="#065F46"/></linearGradient></defs>
            </svg>
            <h1 style={styles.headerTitle}>Vedicure</h1>
          </div>
          {windowWidth >= 768 && <nav style={styles.navContainer}><NavLink viewName="dashboard">Dashboard</NavLink><NavLink viewName="scheduler">Scheduler</NavLink><NavLink viewName="records">Records</NavLink><NavLink viewName="profile">Profile</NavLink></nav>}
          <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: palette.secondary, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', color: palette.primary, cursor: 'pointer'}} onClick={() => setView('profile')}>AV</div>
        </div>
      </header>
      <main style={styles.mainContent}>{renderContent()}</main>
      <Footer />
       <Modal isOpen={isScheduleModalOpen} onClose={() => setScheduleModalOpen(false)} title="Schedule New Therapy"><form style={{display: 'flex', flexDirection: 'column', gap: '16px'}}><Button type="primary" style={{width: '100%'}}>Schedule</Button></form></Modal>
      <Modal isOpen={isFeedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} title={`Log Feedback for ${selectedPatient?.name}`}><form style={{display: 'flex', flexDirection: 'column', gap: '16px'}}><div><label style={styles.label}>Feedback Type</label><select style={styles.select}><option>Symptom Report</option><option>Improvement</option><option>Side Effect</option></select></div><div><label style={styles.label}>Notes</label><textarea rows="4" style={{...styles.input, width: 'calc(100% - 24px)'}}></textarea></div><Button type="primary" style={{width: '100%', marginTop: '16px'}}>Save Feedback</Button></form></Modal>
    </div>
  );
}

