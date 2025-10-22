from datetime import datetime, timedelta
from typing import Optional, Dict

class SessionManager:
    def __init__(self):
        self.sessions: Dict[str, dict] = {}
    
    def store_session(self, session_data: dict):
        session_id = session_data['sessionId']
        self.sessions[session_id] = session_data
        self._cleanup_expired()
    
    def get_session(self, session_id: str) -> Optional[dict]:
        session = self.sessions.get(session_id)
        if session and session['expiresAt'] > datetime.now():
            return session
        elif session:
            del self.sessions[session_id]
        return None
    
    def remove_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]
    
    def _cleanup_expired(self):
        now = datetime.now()
        expired = [sid for sid, sess in self.sessions.items() if sess['expiresAt'] <= now]
        for sid in expired:
            del self.sessions[sid]

session_manager = SessionManager()
