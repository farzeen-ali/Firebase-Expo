export type ChatRole = 'user' | 'model';

export type ChatMessageStatus = 'streaming' | 'complete' | 'error';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
  status: ChatMessageStatus;
};

export type ChatThread = {
  id: string;
  title: string;
  preview: string;
  createdAt: number;
  updatedAt: number;
};

export type ChatTurn = {
  role: ChatRole;
  text: string;
};
