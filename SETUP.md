# De Paul School Bilari – Student Notes Website

This is a free, smartboard-friendly notes portal. It uses a static website plus Firebase's free Spark plan.

## 1. Create the free Firebase project
Go to Firebase Console and create a project. No paid plan is required for the basic setup.

Enable:
- Authentication → Sign-in method → Email/Password
- Firestore Database
- Storage

Create one teacher account under Authentication → Users.

## 2. Add the web app
In Firebase Project Settings, add a Web app (`</>`). Copy the Firebase configuration.

Open `app.js` and replace the six `PASTE_...` values in `firebaseConfig`.

## 3. Add security rules
Copy `firestore.rules` into Firestore → Rules.

Copy `storage.rules` into Storage → Rules.

The rules allow everyone to read notes, but only a logged-in teacher to upload/change notes.

## 4. Publish for free
The easiest option is GitHub Pages:
1. Create a GitHub account.
2. Create a new public repository.
3. Upload all files from this folder.
4. In Settings → Pages, choose the `main` branch and `/ (root)`.
5. GitHub will give you a free `github.io` website address.

## 5. How you will use it
- Open the website on the smartboard.
- Students tap a class/subject note and press **Open Notes**.
- On any device, tap **Teacher Login**.
- Log in and use **Teacher Upload** to upload a PDF.
- The note appears on the student portal automatically.

## Important
Do not share the teacher email/password with students.

For a school domain, custom branding/logo and multiple teachers, the same site can be extended later.
