import { scheduleMeeting } from '../scheduleMeeting.js';
import { expect } from 'chai';

describe('Schedule Meeting Utility', () => {
  it('should open Google Calendar with correct parameters', () => {
    // Simulate window object
    global.window = {};
    global.window.location = {
      search: '?title=Sneakers&description=Air%20Jordans%20for%20sale&sellerEmail=vk440@scarletmail.rutgers.edu'
    };

    let openedUrl = null;
    global.window.open = function (url, target) {
      openedUrl = url;
    };

    // Run the function
    scheduleMeeting();

    const requiredParams = [
      'https://calendar.google.com/calendar/render?action=TEMPLATE',
      'text=Interested%20in%20buying%20Sneakers',
      'details=Interested%20in%20buying%3A%20SneakersAir%20Jordans%20for%20sale',
      'location=Rutgers%20University',
      'add=vk440%40scarletmail.rutgers.edu'
    ];

    const allParamsIncluded = requiredParams.every(param => openedUrl.includes(param));
    expect(allParamsIncluded).to.be.true;
  });
});
