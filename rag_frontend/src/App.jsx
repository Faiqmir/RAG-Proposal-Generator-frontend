import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ChatProvider } from './context/ChatContext'
import ChatPage from './pages/ChatPage'
import ReportPage from './pages/ReportPage'
import 'antd/dist/reset.css'
import './App.css'

function App() {
  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/report" element={<ReportPage />} />
        </Routes>
      </Router>
    </ChatProvider>
  )
}

export default App