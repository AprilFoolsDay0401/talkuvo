# TalkUvo 🗣️

TalkUvo is a community platform similar to Reddit. It provides a space where people can discuss and debate various topics.

## 🚀 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Real-time)
- **UI Components**: Radix UI, Lucide React
- **State Management**: React Hooks

## ✨ Key Features

- 🔐 User Authentication (Sign up/Login)
- 🏘️ Community Creation and Management
- 📝 Post Creation and Sharing
- 💬 Comment System
- 👍 Voting System (Upvote/Downvote)
- 🔍 Search Functionality
- 📱 Responsive Design

## 🛠️ Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd talkuvo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file and add the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase Project Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Copy the project URL and anon key from project settings and set them in environment variables
3. Run the following SQL to create the database schema:

```sql
-- User Profile Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Table
CREATE TABLE communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  community_id UUID REFERENCES communities(id) NOT NULL,
  post_type TEXT CHECK (post_type IN ('text', 'link', 'image')) NOT NULL,
  url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment Table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  post_id UUID REFERENCES posts(id) NOT NULL,
  parent_id UUID REFERENCES comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vote Table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  post_id UUID REFERENCES posts(id),
  comment_id UUID REFERENCES comments(id),
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- Community Members Table
CREATE TABLE community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  community_id UUID REFERENCES communities(id) NOT NULL,
  role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy Setup (Example)
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root Layout
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global Styles
├── components/          # Reusable Components
│   ├── ui/             # Basic UI Components
│   └── NavBar.tsx      # Navigation Bar Component
├── hooks/               # Custom Hooks
│   ├── useAuth.ts      # Authentication Hook
│   └── useToast.ts     # Toast Hook
└── lib/                 # Utilities & Configuration
    ├── supabase.ts     # Supabase Client
    └── utils.ts        # Utility Functions
```

## 🎨 Design System

- **Colors**: Orange (#f97316) as the main color
- **Typography**: Inter font
- **Components**: High accessibility components based on Radix UI
- **Responsive**: Mobile-first responsive design

## 🔮 Future Plans

- [ ] User Profile Page
- [ ] Community Creation/Management Features
- [ ] Post Creation/Editing Features
- [ ] Comment System
- [ ] Voting System
- [ ] Search Functionality
- [ ] Notification System
- [ ] Dark Mode
- [ ] PWA Support

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is distributed under the MIT License. See the `LICENSE` file for details.

## 📞 Contact

If you have any questions or suggestions about the project, please create an issue.
