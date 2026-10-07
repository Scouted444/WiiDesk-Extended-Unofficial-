// WiiDesk News Channel entries, newest first.
// To post a new story, add an object to the TOP of this list.
//   date:     'YYYY-MM-DD'
//   category: 'Update' | 'Channels' | 'Fixes' | 'Info'   (any text works)
//   headline: one line, shown in the list and the ticker
//   body:     the story; blank lines start a new paragraph
var WIIDESK_NEWS = [
    {
        date: '2026-10-07',
        category: 'Update',
        headline: 'Message Board, Wii Settings and News Channel arrive',
        body: 'The Message Board now works: pick a day on the calendar, read letters from WiiDesk or write memos to yourself. A blue badge on the mail button shows how many letters you haven\'t read yet.\n\n' +
            'Wii Settings (from the Wii button) lets you change the sound effect and music volume, switch the clock between 12 and 24 hour time, and format the Wii System Memory.\n\n' +
            'You are reading the News Channel right now, and it is open for business.'
    },
    {
        date: '2026-10-07',
        category: 'Fixes',
        headline: 'Your channel layout is now remembered',
        body: 'Channels used to snap back to the defaults every time the page was loaded. Moving, editing, adding and removing channels in Manage Channels is now kept between visits.\n\n' +
            'The HOME Menu also opens with a right-click now, just like the welcome screen says.'
    },
    {
        date: '2026-09-06',
        category: 'Fixes',
        headline: 'Bug fixes',
        body: 'A round of small fixes to the channel grid and the Channel Manager.'
    },
    {
        date: '2026-09-04',
        category: 'Channels',
        headline: 'Channels can now be edited',
        body: 'Open Manage Channels, then press the pencil on any channel to change its name, icon, preview image, preview music or the website it opens.'
    },
    {
        date: '2026-09-03',
        category: 'Channels',
        headline: 'WiiDesk Discord channel added',
        body: 'There\'s a new channel on the menu that takes you straight to the WiiDesk Discord server. Come say hi!'
    }
];
