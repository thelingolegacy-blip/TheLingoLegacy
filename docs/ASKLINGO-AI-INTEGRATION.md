# askLINGO — AI Assistant Integration Layer

## Overview
askLINGO is the conversational interface for the Lingo ⭐️ Legacy ecosystem, powered by Claude (ChatGPT alternative) and Google Gemini.

## Architecture

### Core Services
- **Claude (Anthropic):** Primary reasoning, story generation, game logic
- **Google Gemini:** Multi-modal understanding, image analysis, creative direction
- **Local caching:** Conversation history, user context

### Integration Points

#### 1. Homepage Integration
```html
<div class="ask-lingo-widget">
  <button id="ask-lingo-btn" class="floating-action">
    <img src="/assets/lingo-mark.svg" alt="Ask Lingo">
  </button>
  <div id="ask-lingo-chat" class="chat-panel hidden">
    <!-- Chat interface -->
  </div>
</div>
```

#### 2. Product Pages
- **Games:** "How do I play?" assistance
- **Worlds:** Story context and lore explanations
- **Commerce:** Product recommendations and checkout help
- **Studio:** Production workflow guidance

#### 3. Studio Production
- Game design consultation
- Asset generation feedback
- Workflow optimization suggestions
- Release readiness analysis

## API Routes

### Claude Integration
```
POST /api/ask-lingo/chat
- request: { message, context, productId }
- response: { reply, suggestions, actions }
```

### Gemini Integration
```
POST /api/ask-lingo/analyze
- request: { image, query, context }
- response: { analysis, suggestions, metadata }
```

### Memory/Context
```
GET /api/ask-lingo/context/:userId
POST /api/ask-lingo/context/:userId
- Maintains user conversation history and preferences
```

## Use Cases

### For Players
- "What's the best strategy for That's My Lingo?"
- "Tell me about KottonsCode characters"
- "Help me find the perfect apparel item"
- "How do I unlock the next world?"

### For Studio
- "Generate 5 product descriptions for the new game"
- "Analyze this UI screenshot and suggest improvements"
- "What's our current production status?"
- "Help me plan the next release cycle"

### For Community
- "What's happening in Lingo World this week?"
- "Connect me with similar players"
- "Show me trending products and games"

## Implementation Stack

### Backend (Cloud Functions / Firebase)
```javascript
exports.askLingo = onRequest(async (req, res) => {
  const { message, userId, context } = req.body;
  
  // Route to Claude or Gemini based on request type
  if (req.body.hasImage) {
    return await handleGemini(message, context);
  } else {
    return await handleClaude(message, userId, context);
  }
});
```

### Frontend (Web + Flutter)
```dart
class AskLingoWidget extends StatefulWidget {
  @override
  State<AskLingoWidget> createState() => _AskLingoWidgetState();
}

class _AskLingoWidgetState extends State<AskLingoWidget> {
  final TextEditingController _controller = TextEditingController();
  List<ChatMessage> messages = [];

  Future<void> _sendMessage(String text) async {
    // Send to askLINGO backend
    final response = await http.post(
      Uri.parse('${apiHost}/api/ask-lingo/chat'),
      body: {
        'message': text,
        'userId': currentUser.id,
        'context': currentContext,
      },
    );
    
    setState(() {
      messages.add(ChatMessage(text: response['reply'], sender: 'lingo'));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            itemCount: messages.length,
            itemBuilder: (context, index) {
              return ChatBubble(message: messages[index]);
            },
          ),
        ),
        TextField(
          controller: _controller,
          onSubmitted: _sendMessage,
          decoration: InputDecoration(
            hintText: 'Ask Lingo...',
            prefixIcon: Icon(Icons.star),
          ),
        ),
      ],
    );
  }
}
```

## Deployment Strategy

### Phase 1: Web Widget (Weeks 1-2)
- Deploy askLINGO chat widget to homepage
- Connect Claude API for basic player questions
- Test on desktop and mobile

### Phase 2: Product Integration (Weeks 3-4)
- Add askLINGO to game pages
- Add askLINGO to story worlds
- Add askLINGO to commerce flows

### Phase 3: Studio Production (Weeks 5-6)
- Deploy askLINGO to admin command center
- Add Gemini for image/screenshot analysis
- Integrate with release and approval workflows

### Phase 4: Flutter App (Weeks 7-8)
- Embed askLINGO chat in Flutter app
- Full context awareness for mobile
- Offline conversation history sync

## Safety & Governance

### Content Filtering
- Block real-money discussion in public chat
- Redirect payout questions to official channels
- Maintain child-safe language guidelines

### User Privacy
- Conversation history stored per-user in Firestore
- Option to delete chat history
- No telemetry without explicit opt-in
- GDPR/COPPA compliant

### Approval Gates
- Production deployment requires Chief Architect sign-off
- All AI-generated content reviewed before live
- Rollback capability for any response type

## Success Metrics

- Chat engagement rate
- Average conversation length
- User satisfaction (thumbs up/down)
- Conversion on recommendations (games, products)
- Reduction in support tickets
- Time-to-resolution for user questions

---

## Next Steps

1. Set up Claude and Gemini API keys in production secrets
2. Build askLINGO backend service
3. Deploy web widget to homepage
4. A/B test conversational flows
5. Integrate with Firestore for memory
6. Connect to studio production workflows
7. Launch on Flutter app

---

**The Lingo ⭐️ Legacy Studio**  
*One brand. Many worlds. Always listening.*
