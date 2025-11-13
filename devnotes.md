# Week 9 Reflection

## Current Progress 

I have a very basic javascript layout and a text box that you can type in. Basic keyboard shortcuts like ctrl+b and ctrl+c can be used for formatting. Pressing the save button saves the note with formatting to localStorage. The saved note is automatically loaded on refresh. The bold button is not in a state that I'd consider functional.

## Challenges & Lessons

Writing a rich text editor from scratch may not be doable in the timeframe I have; especially since I'm only following the JS documentation rather than any tutorials. 

I have a generalized recursive solution written down for my bold button issues, but haven't had time to implement it. Once I figure out the bold button though, my solution should generalize to applications like font size selection.

I've learned a great deal so far.

I'm making the most of my github repo. I'm actually bothering to create branches which I've never cared to do for small projects before.

[Here's my stream-of-conscious dev notes in the wiki. I think they're publicly viewable.](https://github.com/SamRichter01/notes/wiki/Development-Notes)

# Week 10 Reflection

## Progress

This week I added a basic file system that includes folders and notes. I added buttons that allow the user to create and delete both kinds of files. The left navigation pane is the file explorer. 

* Notes are normal formatted text, folders are italicized. This is a placeholder for actual styling and icons that will come later.
* Clicking a folder or note will bring it up in the editor. Folders don't have content so their title appears but the editor is disabled. I'd like this behavior to change in the future (see below).
* Clicking in the pane but outside of the list deselects notes and allows new folders and notes to be created within the root folder.

I also added a date created timestamp that appears in the editor. The date codes are used as unique identifiers for individual nodes in the file tree.

I reintroduced autosaving. Changes to the names of files or their content will automatically be saved to localStorage.

## Problems

I have one major ongoing issue, but I didn't run into any major blockers this week. Most of my challenges came from learning new interfaces and idiosyncrasies of JS.

In order to enable autosaving I needed to find a way to detect changes in my iframe's document. I turned to the mutationObserver interface for this. The problem is, even though I set the observer's target to be my iframe's document, changes within the main document still trigger the observer. This crashes the app when a user tries to delete a child node from the file tree, as the observer triggers and runs the save function before the deletion process is complete. I don't yet know how to address this. 

** Nevermind! I took 5 minutes and fixed it. I'll leave the above part in for posterity **

## Plans

* I'd like to add expanding and minimizing folders and notes in the file explorer
* I don't know if notes should be able to contain notes or folders themselves. It might make sense in some contexts?
* I'd like the ability to reorganize notes and folders by using the Drag and Drop API
* I'd like to rework some of my recursion code to implement new JS features that I've learned.
* I'd like to add a tagging system
* I still really want to investigate creating a server layer, and maybe even live collaborative editing through WebHooks. That's alot to do in 5 weeks so it'll probably have to be something I do after this class is done.

[Once again here's the link to my repo with my in-the-moment notes in the wiki](https://github.com/SamRichter01/notes)

# Week 11 Reflection

## Reflection Questions

* I added a manifest.json file, a serviceworker.js file, and a script that registers the serviceworker. The manifest.json file contains settings and data that the browser looks for to determine if the application is a PWA and how it should be configured. Serviceworker.js contains a script that is registered by the script in index.html as a serviceworker object. The serviceworker script handles caching for offline fucntionality when the server/browser isn't running.
* I tested the offline functionality by opening the application in the browser and installing it. I first tested it by shutting off the server and closing the browser to see if the data still saved to localstorage. I then used the devtools network simulator to test if it would work in truly offline mode.
* Initially I thought that the serviceWorker was not necessary for offline functionality, but I realized it was required to save data between offline and online sessions. I also had an issue where my noteNode.js file was not cached. Fortunately I was able to identify the problem. 

## Progress

* On top of my progress with the PWA conversion, I got basic drag and drop functionality working in my file explorer. There is still a lot missing; files can be dragged into themselves which causes an error, and I'd like to be able to order files by dragging.

## Problems

* My problems this week were human problems. Through a mix of being busy and procrastinating I only completed about 2 hours of kcoding wor.