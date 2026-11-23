import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';

const _background = Color(0xFF08090E);
const _gold = Color(0xFFE6BD58);
const _cyan = Color(0xFF54E7F2);
const _muted = Color(0xFFAAB3C7);

/// Selects a safe preview or an authenticated Firebase session.
/// It never treats local UI state as proof of identity.
class FirebaseEntry extends StatelessWidget {
  const FirebaseEntry({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (Firebase.apps.isEmpty) {
      return Column(
        children: [
          Material(
            color: const Color(0xFF302719),
            child: const SafeArea(
              bottom: false,
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                child: Row(
                  children: [
                    Icon(Icons.lock_outline, color: _gold, size: 18),
                    SizedBox(width: 9),
                    Expanded(
                      child: Text(
                        'Offline preview — connect an approved Firebase project to enable accounts.',
                        style: TextStyle(color: Colors.white, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Expanded(child: child),
        ],
      );
    }

    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.userChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const _SessionLoading();
        }
        if (snapshot.hasError) {
          return _SessionError(message: 'Unable to verify your account session.');
        }
        final user = snapshot.data;
        if (user == null) return const FirebaseSignInScreen();
        if (!user.emailVerified) return FirebaseVerificationScreen(user: user);
        return Column(
          children: [
            Material(
              color: const Color(0xFF111522),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 12, 8),
                  child: Row(
                    children: [
                      const Icon(Icons.verified_user_outlined, color: _cyan, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          user.email ?? 'Signed in',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: _muted, fontSize: 12),
                        ),
                      ),
                      TextButton(
                        onPressed: () async {
                          try {
                            await FirebaseAuth.instance.signOut();
                          } catch (_) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Sign out could not be completed. Try again.')),
                              );
                            }
                          }
                        },
                        child: const Text('Sign out'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Expanded(child: child),
          ],
        );
      },
    );
  }
}

class FirebaseSignInScreen extends StatefulWidget {
  const FirebaseSignInScreen({super.key});

  @override
  State<FirebaseSignInScreen> createState() => _FirebaseSignInScreenState();
}

class _FirebaseSignInScreenState extends State<FirebaseSignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _createAccount = false;
  bool _busy = false;
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _busy = true; _error = null; });
    try {
      final auth = FirebaseAuth.instance;
      if (_createAccount) {
        final credential = await auth.createUserWithEmailAndPassword(
          email: _email.text.trim(),
          password: _password.text,
        );
        await credential.user?.sendEmailVerification();
      } else {
        await auth.signInWithEmailAndPassword(
          email: _email.text.trim(),
          password: _password.text,
        );
      }
    } on FirebaseAuthException catch (error) {
      setState(() => _error = _authMessage(error.code));
    } catch (_) {
      setState(() => _error = 'The account request could not be completed. Please try again.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _resetPassword() async {
    final email = _email.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      setState(() => _error = 'Enter your email address first to request a reset link.');
      return;
    }
    setState(() { _busy = true; _error = null; });
    try {
      await FirebaseAuth.instance.sendPasswordResetEmail(email: email);
      if (mounted) setState(() => _error = 'If an account exists for that address, a reset email has been sent.');
    } on FirebaseAuthException catch (error) {
      if (mounted) setState(() => _error = _authMessage(error.code));
    } catch (_) {
      if (mounted) setState(() => _error = 'Password reset is temporarily unavailable.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _authMessage(String code) => switch (code) {
    'invalid-email' => 'That email address is not valid.',
    // Keep account-existence and account-state errors indistinguishable.
    'user-disabled' || 'user-not-found' || 'wrong-password' || 'invalid-credential' || 'email-already-in-use' =>
      'The account request could not be completed with those details. Check the information and try again.',
    'weak-password' => 'Choose a stronger password with at least 8 characters.',
    'too-many-requests' => 'Too many attempts. Wait a moment and try again.',
    'network-request-failed' => 'Network unavailable. Check your connection and retry.',
    'operation-not-allowed' => 'Email and password sign-in is not enabled for this Firebase project.',
    _ => 'The account request could not be completed. Please try again.',
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _background,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Card(
              color: const Color(0xFF111522),
              child: Padding(
                padding: const EdgeInsets.all(26),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Icon(Icons.public, color: _gold, size: 42),
                      const SizedBox(height: 14),
                      const Text('THE LINGO LEGACY', textAlign: TextAlign.center,
                        style: TextStyle(color: _gold, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                      const SizedBox(height: 8),
                      Text(_createAccount ? 'Create your account' : 'Welcome back',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white, fontSize: 25, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 8),
                      const Text('Your account identity is verified by Firebase Authentication.',
                        textAlign: TextAlign.center, style: TextStyle(color: _muted, height: 1.4)),
                      const SizedBox(height: 24),
                      TextFormField(
                        controller: _email,
                        keyboardType: TextInputType.emailAddress,
                        autofillHints: const [AutofillHints.email],
                        decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
                        validator: (value) {
                          final email = value?.trim() ?? '';
                          return email.contains('@') && email.contains('.') ? null : 'Enter a valid email address.';
                        },
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller: _password,
                        obscureText: _obscure,
                        autofillHints: _createAccount ? const [AutofillHints.newPassword] : const [AutofillHints.password],
                        decoration: InputDecoration(
                          labelText: 'Password',
                          border: const OutlineInputBorder(),
                          suffixIcon: IconButton(
                            onPressed: () => setState(() => _obscure = !_obscure),
                            icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off),
                          ),
                        ),
                        validator: (value) {
                          final password = value ?? '';
                          if (_createAccount && password.length < 8) return 'Use at least 8 characters.';
                          if (password.isEmpty) return 'Enter your password.';
                          return null;
                        },
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 14),
                        Text(_error!, style: const TextStyle(color: Color(0xFFFF8B8B))),
                      ],
                      const SizedBox(height: 20),
                      FilledButton(
                        onPressed: _busy ? null : _submit,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: _busy
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                            : Text(_createAccount ? 'Create account' : 'Sign in'),
                        ),
                      ),
                      if (!_createAccount)
                        TextButton(onPressed: _busy ? null : _resetPassword, child: const Text('Forgot password?')),
                      TextButton(
                        onPressed: _busy ? null : () => setState(() { _createAccount = !_createAccount; _error = null; }),
                        child: Text(_createAccount ? 'Already have an account? Sign in' : 'New here? Create an account'),
                      ),
                      const SizedBox(height: 8),
                      const Text('Wallets, balances, and protected data remain unavailable until server-side authorization is approved.',
                        textAlign: TextAlign.center, style: TextStyle(color: _muted, fontSize: 11, height: 1.4)),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class FirebaseVerificationScreen extends StatefulWidget {
  const FirebaseVerificationScreen({required this.user, super.key});
  final User user;

  @override
  State<FirebaseVerificationScreen> createState() => _FirebaseVerificationScreenState();
}

class _FirebaseVerificationScreenState extends State<FirebaseVerificationScreen> {
  bool _busy = false;
  String? _message;

  Future<void> _refresh() async {
    setState(() { _busy = true; _message = null; });
    try {
      await widget.user.reload();
      if (mounted) setState(() => _message = FirebaseAuth.instance.currentUser?.emailVerified == true
        ? 'Email verified. Your session is refreshing.'
        : 'Email verification is still pending.');
    } catch (_) {
      if (mounted) setState(() => _message = 'Could not refresh verification status. Try again.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: _background,
    body: Center(child: Padding(
      padding: const EdgeInsets.all(24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 440),
        child: Card(child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.mark_email_unread_outlined, color: _gold, size: 48),
            const SizedBox(height: 16),
            const Text('Verify your email', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            Text('Open the verification link sent to ${widget.user.email ?? 'your email address'}, then refresh your status.',
              textAlign: TextAlign.center, style: const TextStyle(color: _muted)),
            if (_message != null) ...[const SizedBox(height: 12), Text(_message!, textAlign: TextAlign.center)],
            const SizedBox(height: 20),
            FilledButton(onPressed: _busy ? null : _refresh, child: Text(_busy ? 'Checking…' : 'I verified my email')),
            TextButton(onPressed: () => FirebaseAuth.instance.signOut(), child: const Text('Sign out')),
          ]),
        )),
      ),
    )),
  );
}

class _SessionLoading extends StatelessWidget {
  const _SessionLoading();

  @override
  Widget build(BuildContext context) => const Scaffold(
    backgroundColor: _background,
    body: Center(child: CircularProgressIndicator(color: _gold)),
  );
}

class _SessionError extends StatelessWidget {
  const _SessionError({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: _background,
    body: Center(child: Padding(
      padding: const EdgeInsets.all(24),
      child: Text(message, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white)),
    )),
  );
}
