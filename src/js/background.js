import _ from 'lodash';

let lastTrigger = null;
const BUMPERS = [
  "https://www.youtube.com/embed/RNIUWxUQddA?autoplay=1",
  "https://www.youtube.com/embed/ukT5tjKkAyk?autoplay=1",
];

const CHANCE = 1.0;
chrome.webNavigation.onBeforeNavigate.addListener((e) => {
  if (!lastTrigger) {
    return lastTrigger = Date.now();
  }
  // Show bumper every 15 minutes
  // if navigation is top level and not a bumper!!
  if (
    Math.abs(lastTrigger - Date.now()) > 1000 * 60 * 15 && 
    !_.includes(BUMPERS, e.url) && 
    !e.frameId
  ) {
    lastTrigger = Date.now();
    chrome.tabs.create({
      active: true,
      url: _.sample(BUMPERS), 
    }, (tab) => {
      // Inject script to listen for bumper end and send message
      chrome.tabs.executeScript(tab.id, {
        code: `document.querySelector('video').addEventListener('ended', () => {
          chrome.runtime.sendMessage({ type: 'bumperended' });
        });`,
      });      
    });
  }
});


// Close ended bumpers
chrome.runtime.onMessage.addListener((req, sender) => {
  if (req.type === 'bumperended') {
    chrome.tabs.remove(sender.tab.id);
  }
});