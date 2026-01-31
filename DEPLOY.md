# How to get your wedding RSVP app online

Everything here is **free**. You'll need to create 3 accounts and upload some files. I've broken it down into small steps — just follow them in order and you'll be done in about 20–25 minutes.

You'll need: your email, a password manager (or somewhere to save a few things), and the **wedding-deploy.zip** file you downloaded.

**First: unzip the file** on your computer. You'll see two folders inside: `backend` and `frontend`. Keep this window open — you'll come back to these files a few times.

---

## The big picture (what we're setting up and why)

Think of the app as 3 pieces working together:

1. **The database** — this is where all the RSVPs get saved. We use a free service called **MongoDB Atlas** to store this.
2. **The brain** — this is the code that runs in the background, saving RSVPs to the database and checking admin logins. We use a free service called **Render** to keep it running.
3. **The website** — this is what your guests actually see and interact with. We use a free service called **Vercel** to put it on the internet.

We set them up in that order — database first, then the brain, then the website — because each one needs to know where the previous one lives.

---

## Step 1 of 3 — Set up the database (MongoDB Atlas)

This is where all your guests' RSVPs will be stored.

1. Go to **https://www.mongodb.com/cloud/atlas**
2. Click **Create a free account** and sign up with your email.
3. After signing in, you'll see a button that says **Create your free cluster** — click it.
4. On the next page, just leave everything as it already is and click **Create Deployment** at the bottom.
5. Next it asks you to make a **username and password** for the database. Type in anything you like for both — just write them down somewhere safe. Then click **Create User**.
6. It then asks where you want to connect from. Click **My current IP Address**, then click **Add IP Address**.
7. You'll land on a page showing your new database. Click the green **Connect** button.
8. In the popup, click **Drivers**.
9. There's a dropdown that says something like "Select your driver" — pick **Node.js** and pick any version.
10. You'll now see a line of text that starts with `mongodb+srv://...` — this is called the **connection string**. **Copy it and paste it somewhere safe** (like a notes app). You'll need it in the next step.

✅ Done with the database! Move on to Step 2.

---

## Step 2 of 3 — Set up the brain (Render)

This is the service that runs your app in the background. But first, we need to put your files somewhere it can find them — a place called **GitHub**.

### First: create a GitHub account and upload your files

1. Go to **https://github.com** and sign up for a free account.
2. Click the **+** icon in the top right, then click **New repository**.
3. Give it any name, like `wedding-rsvp`. Scroll down and tick the box that says **Add a README file**, then click **Create repository**.
4. You're now on an empty repo page. Click **Add file → Upload file**.
5. Drag and drop **everything** from your unzipped wedding-deploy folder into the upload area (both the `backend` and `frontend` folders, plus `.gitignore` and `README.md`).
6. Scroll down and click the green **Commit changes** button. Your files are now uploaded.

### Now: create the `.env` file (the settings file)

This is a small file that holds secret settings your app needs. GitHub doesn't have a great way to create files in the browser, so here's a simple way:

1. On your repo page, click **Add file → New file**.
2. In the filename box at the top, type exactly: `backend/.env`
3. In the big text area below, paste the following. **Replace the parts in angle brackets with your own values:**

```
MONGO_URL=<paste your mongodb+srv:// connection string from Step 1 here>
DB_NAME=wedding
JWT_SECRET=<type any random word or phrase here, e.g. "mywedding2026secret">
ADMIN_PASSWORD=Ksh*0889
CORS_ORIGINS=
```

   - **MONGO_URL** — paste the connection string you saved in Step 1.
   - **DB_NAME** — just leave it as `wedding`.
   - **JWT_SECRET** — this is a secret key the app uses to keep the admin login secure. It can be anything — just type a random phrase.
   - **ADMIN_PASSWORD** — this is what you'll type to log into the admin dashboard later. It's already set to `Ksh*0889` but you can change it to anything you like.
   - **CORS_ORIGINS** — leave this blank for now. We'll fill it in later.

4. Scroll down and click **Commit changes**.

### Now: set up Render

1. Go to **https://render.com** and create a free account. Signing up with your GitHub account is the easiest option — click **Sign up with GitHub** and allow it.
2. Once you're in, click **New** in the top right, then click **Web Service**.
3. Click **Connect account** next to GitHub if it's not connected yet, and allow access.
4. You should see your `wedding-rsvp` repo in the list. Click on it.
5. Fill in the form like this:
   - **Name:** `wedding-rsvp-api` (or anything you like)
   - **Region:** Singapore
   - **Root Directory:** type `backend`
   - **Build Command:** type `pip install -r requirements.txt`
   - **Start Command:** type `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
6. Click **Create Web Service** at the bottom.
7. Wait a minute or two. Render will read your files and start the app. You'll see it say **Live** in green when it's ready.
8. At the top of the page you'll see a URL that looks like **https://wedding-rsvp-api.onrender.com** — **copy this and save it somewhere**. You'll need it in the next step.

✅ Done with the brain! Move on to Step 3.

---

## Step 3 of 3 — Put the website online (Vercel)

This is the part where your guests will actually be able to see and use the app.

1. Go to **https://vercel.com** and create a free account. Again, **Sign up with GitHub** is the easiest.
2. Click **New Project**.
3. Under "Import Git Repository", you should see your `wedding-rsvp` repo. Click **Import** next to it.
4. Fill in the settings:
   - **Project Name:** type `wedding-rsvp` (or anything — this becomes part of your final URL)
   - **Root Directory:** click **Edit** and type `frontend`
   - **Framework Preset:** select **Create React App**
   - **Build Command:** type `craco build`
   - **Install Command:** type `yarn install`
   - **Output Directory:** type `build`
5. **Before you click Deploy**, look for a section that says **Environment Variables**. Click to expand it, then:
   - Click **Add**
   - In the first box (the name), type exactly: `REACT_APP_BACKEND_URL`
   - In the second box (the value), paste the Render URL you saved in Step 2 (e.g. `https://wedding-rsvp-api.onrender.com`)
6. Now click **Deploy**. Wait 30–60 seconds.
7. You'll see a success page with your new URL — something like **https://wedding-rsvp.vercel.app**. That's your wedding app! 🎉

---

## Step 4 — One last thing (connecting the pieces)

The brain (Render) needs to know your website's URL so it will accept messages from it. Go back to Render and do this:

1. Go to **https://render.com** and click on your `wedding-rsvp-api` service.
2. In the left sidebar, click **Environment**.
3. You'll see the settings you entered earlier. Find the one called **CORS_ORIGINS** — it should be blank.
4. Click on it and paste your Vercel URL (e.g. `https://wedding-rsvp.vercel.app`). Make sure there's **no slash at the end**.
5. Click **Save Changes**. It'll redeploy automatically — just wait for it to say **Live** again.

✅ Everything is connected now!

---

## Step 5 — Test it works

1. Open your Vercel URL on your **phone** (e.g. `https://wedding-rsvp.vercel.app`). This is what your guests will see.
2. Fill in the RSVP form with a fake name and submit it. You should see a green checkmark and a "Thank You" message.
3. Now test the admin dashboard. Type your URL with **/admin** at the end (e.g. `https://wedding-rsvp.vercel.app/admin`).
4. Log in with the admin password (it's `Ksh*0889` unless you changed it in Step 2).
5. You should see the fake RSVP you just submitted. The numbers at the top should update, and the "Download CSV" button should work too.

**If the form submits but nothing happens** (no thank you screen, no error) — the most likely issue is a typo in one of the URLs. Double-check that the `REACT_APP_BACKEND_URL` on Vercel matches your Render URL exactly.

---

## Sharing with your guests

Once everything works, all you need to do is share this one link:

**https://wedding-rsvp.vercel.app**

(Replace `wedding-rsvp` with whatever name you chose on Vercel.)

That's it. No downloads, no accounts, no logins needed on their end. They just open the link, fill in the form, and tap submit.

---

## Quick cheat sheet — things to keep saved somewhere

| What | Where to find it |
|---|---|
| Your Vercel URL (guest-facing link) | Shown on Vercel after deploy |
| Your admin URL | Same as above, but add `/admin` at the end |
| Admin password | Whatever you set in the `.env` file (default: `Ksh*0889`) |
| MongoDB username & password | What you created in Step 1 |
