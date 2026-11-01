import { ChatWindow } from "@/features/chat/ChatWindow";

export default async function ChatPage({ params }: PageProps<"/chat/[matchId]">) {
  const { matchId } = await params;
  return <ChatWindow matchId={matchId} />;
}
