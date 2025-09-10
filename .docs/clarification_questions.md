# Frontend Development Clarification Questions 🤖💬

## Project Overview
Based on your project plan, you're building a frontend-only solution that integrates with:
- **Chatbot.com** for AI chatbot functionality
- **Kommo CRM** for live chat agent dashboard
- **Custom frontend** for user-facing chat interface

ANSWER => nope am building a custom chatbot and live ticketing system for zongotek but i will draw inspiration from the listed sites

---

## 1. User-Facing Chat Interface Questions

### 1.1 Chat Widget Design
- **Q1.1**: What should the chat widget look like? (floating bubble, embedded, full-page overlay?)
ANSWER => floating bubble that on hover shows shat but on vlivk opens the chat. on mobile full view but on desktop just coner like all other chat bots
- **Q1.2**: Should the chat widget be draggable/resizable by users?
ANSWER => yes if thats possible i would like that
- **Q1.3**: What's the preferred color scheme and branding for the chat widget?
ANSWER => theme adaptive but you can  decide the dest minimalistic but cool looking
- **Q1.4**: Should there be different chat widget designs for different pages/sections?
ANSWER => I DONT UNDERSTAND BUT I THINK NO

### 1.2 Chatbot.com Integration
- **Q1.5**: Do you have the Chatbot.com API credentials/endpoints ready?
ANSWER => nope we are not going to use chatbot.com api or it. its just an inspiration, we will build ourown later that gets the nessage and processes using our knowlodge base and send a response, but later
- **Q1.6**: What specific Chatbot.com features do you want to integrate? (just chat, or also analytics, custom flows?)
ANSWER => the chat flow feature for the chatbot preprogrammed answers the story we build that screen flow diagram
- **Q1.7**: Should the chatbot responses include rich media (images, buttons, carousels)?
ANSWER => buttons yes i want those, image maybe later and carousels later 
- **Q1.8**: Do you want to customize the chatbot's appearance to match your brand?
ANSWER => yes

### 1.3 Live Agent Transfer
- **Q1.9**: How should the transfer from chatbot to live agent be triggered? (automatic detection, user request button, timeout?)
ANSWER => we will have user request button, also text if user types that they want to talk to an agent or human, also yes automatic detection like at end of flow diagram knowledge base that we have nothing
- **Q1.10**: What should users see during the transfer process? (loading animation, status message?)
ANSWER => loading animation whith status we are transfering you to a live agent
- **Q1.11**: Should there be a queue system if no agents are available?
ANSWER => yes

### 1.4 Chat History & Session Management
- **Q1.12**: How long should chat sessions persist? (browser session, 24 hours, indefinite?)
ANSWER => browser session and 24 hours
- **Q1.13**: Should users be able to download/export their chat history?
ANSWER => yes as pdf
- **Q1.14**: Do you want chat history to sync across different devices/browsers?
ANSWER => Yes

---

## 2. Kommo CRM Integration Questions

### 2.1 Dashboard Integration
- **Q2.1**: Do you have Kommo CRM API access and documentation?
ANSWER =>nope and THERE WILL NOT BE KOMMOS ITS JUST FOR INSPIRATION ON UI INTERFACE
- **Q2.2**: Should the frontend embed Kommo's dashboard directly or create a custom wrapper?
ANSWER => we will vreate our own just get inspiration from kommos
- **Q2.3**: What specific Kommo features do you need? (contact management, deal tracking, task management?)
ANSWER => JUST INSPIRATION NOT REALLY GETTING ANYTHING HERE

### 2.2 Agent Interface
- **Q2.4**: Should agents access the system through your custom frontend or directly through Kommo?
ANSWER => THERE WILL NOT BE KOMMOS ITS JUST FOR INSPIRATION ON UI INTERFACE SO  agents access the system through your custom frontend
- **Q2.5**: Do you need custom agent authentication/login system?
ANSWER => yes
- **Q2.6**: Should there be agent status indicators (online/offline/busy)?
ANSWER => Yes agent upon loging to admin system where they can pick up tickets they willalso have to clock in and they will be shown as active


---

## 3. Central Dashboard Questions

### 3.1 Dashboard Features
- **Q3.1**: What metrics should the dashboard display? (chat volume, response times, satisfaction scores?)
answer => total agents in, number of tickets pending number of tickets closed today, avarage wait time before ticket is picked
- **Q3.2**: Should the dashboard be real-time or refresh periodically?
ANSWER => REAL TIME
- **Q3.3**: Do you need data visualization (charts, graphs) for analytics?
ANSWER => YES 

### 3.2 Ticket System
- **Q3.4**: Since you're using Kommo CRM, should tickets be created as Kommo leads/contacts?
ANSWER => WE ARE NOT USING KOMMOS WE WILL BUILD OUR WOWN
- **Q3.5**: What ticket statuses do you need? (new, assigned, in-progress, resolved, closed?)
ANSWER => PENDING, ASSIGNED FOR TICKETS THAT SOMEONE GETS ASSIGNED, picked, closed.
- **Q3.6**: Should there be ticket priority levels?
ANSWER => fifo

### 3.3 Department Routing
- **Q3.7**: How many departments do you have and what are they?
ANSWER => it should be dynamic that one can create a department but for now we have, sales and operations and technical
- **Q3.8**: Should the routing logic be handled by Chatbot.com or your frontend?
ANSWER => AS I SAID WE ARE NOT USING CHATBOT.COM SO BY FRONTEND SYSTEM
- **Q3.9**: Do you need manual override options for ticket routing?
ANSWER => yes

---

## 4. Technical Implementation Questions

### 4.1 Technology Stack
- **Q4.1**: Should we use the current React template you have, or do you prefer a different framework?
ANSWER => use current React template 
- **Q4.2**: Do you need real-time updates? (WebSocket, Server-Sent Events, or polling?)
ANSWER => yes 
- **Q4.3**: Should the frontend be a Single Page Application (SPA) or multi-page?
ANSWER => multi-page and break things into components no large junk of code in one page like 1000 lines 

### 4.2 Data Storage
- **Q4.4**: Since there's no backend, where should we store temporary data? (localStorage, sessionStorage, IndexedDB?)
ANSWER => you can svhoode the best and eaiest for now. the real backend i will build it later
- **Q4.5**: Do you need offline functionality for the chat widget?
ANSWER => if its easy to implement otherwise no 

### 4.3 Authentication & Security
- **Q4.6**: Do you need user authentication for the dashboard?
ANSWER => yes
- **Q4.7**: Should chat sessions be anonymous or require user registration?
ANSWER => anonymous
- **Q4.8**: Do you need GDPR/privacy compliance features?
ANSWER => am not sure what those are but maybe yes

---

## 5. UI/UX Design Questions

### 5.1 Design System
- **Q5.1**: Do you have brand guidelines, colors, fonts, or logo assets?
ANSWER => get inspiration from kommos and chatbot.com
- **Q5.2**: Should the design be modern/minimal or more traditional?
ANSWER => modern and minimal
- **Q5.3**: Do you prefer light theme, dark theme, or both?
ANSWER => both system has daisy ui theme so it possible perfect it and use that

### 5.2 Responsive Design
- **Q5.4**: Should the chat widget work on mobile devices?
ANSWER =>  yes
- **Q5.5**: Do you need a mobile app or just responsive web design?
ANSWER => just responsive web design

### 5.3 Accessibility
- **Q5.6**: Do you need WCAG compliance for accessibility?
ANSWER => dont know what that is so decide 
- **Q5.7**: Should the chat support screen readers and keyboard navigation?
ANSWER =>  yes

---

## 6. Integration & Deployment Questions

### 6.1 API Integration
- **Q6.1**: Do you have the API documentation for both Chatbot.com and Kommo CRM?
ANSWER =>  no
- **Q6.2**: Should we use their official SDKs or direct API calls?
ANSWER => none
- **Q6.3**: Do you need webhook support for real-time updates?
ANSWER => yes

### 6.2 Deployment
- **Q6.4**: Where do you plan to host the frontend? (Vercel, Netlify, AWS, etc.)
ANSWER => HOSTINGER BUT LETS NOT THINK THIS FAR YET LETS GET IT WORKING
- **Q6.5**: Do you need a custom domain?
ANSWER => NO BUT LETS NOT THINK THIS FAR YET LETS GET IT WORKING
aNSWER => yes it will be called from a different domain so it can be used on the website which is another react project

---

## 7. Additional Features Questions

### 7.1 Notifications
- **Q7.1**: Should the chat widget show browser notifications?
Answer => yes
- **Q7.2**: Do you need email notifications for users or just agents?
ANSWER => just agents

### 7.2 Analytics & Reporting
- **Q7.3**: Do you need custom analytics beyond what Chatbot.com provides?
ANSWER => YESWE ARE NOT USING CHATBOT.COM
- **Q7.4**: Should there be performance monitoring for the chat widget?

### 7.3 Customization
- **Q7.5**: Do you need admin settings to customize the chat widget appearance?
ANSWER => YES
- **Q7.6**: Should there be different chat configurations for different user segments?
ANSWER => NO

---

## 8. Project Scope & Timeline

### 8.1 Priority Features
- **Q8.1**: What are the must-have features for the first version (MVP)?
- **Q8.2**: What features can be added in future iterations?

### 8.3 Testing & Quality
- **Q8.3**: Do you need automated testing setup?
- **Q8.4**: Should we include error tracking and monitoring?

---

## Next Steps
Once you answer these questions, I'll:
1. Create a detailed technical specification
2. Set up the project structure
3. Begin development with the highest priority features
4. Implement the integrations step by step

Please provide answers to as many questions as possible, and we can clarify any unclear points during development.
