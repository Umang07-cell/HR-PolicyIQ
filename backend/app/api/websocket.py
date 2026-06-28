from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict, List, Optional

router = APIRouter(prefix="/ws", tags=["WebSocket"])


class ConnectionManager:
    def __init__(self):
        self.active: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(user_id, []).append(ws)

    def disconnect(self, user_id: int, ws: WebSocket):
        if user_id in self.active:
            try:
                self.active[user_id].remove(ws)
            except ValueError:
                pass

    async def send_to_user(self, user_id: int, message: dict):
        for ws in list(self.active.get(user_id, [])):
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(user_id, ws)


manager = ConnectionManager()


@router.websocket("/notifications/{user_id}")
async def notifications_ws(
    websocket: WebSocket,
    user_id: int,
    role: Optional[str] = Query(default="employee"),
):
    # Basic validation: role must be a known value
    allowed_roles = {"employee", "manager", "hr_admin", "executive"}
    if role not in allowed_roles:
        await websocket.close(code=4003)
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
