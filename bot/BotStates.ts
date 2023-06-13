import { DefaultConversationState, DefaultTempState, DefaultUserState } from "@microsoft/teams-ai";

interface UserState extends DefaultUserState
{
    messageId:string;
    name:string;
    waitingFor:string;
}
interface ConversationState extends DefaultConversationState{
}
interface TempState extends DefaultTempState {    
}
export {UserState, ConversationState,TempState};