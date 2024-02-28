# Global HRM

This app creates a global variable that serves as a reference for apps to use instead of obtaining their own HRM values. This has a huge potential to help with battery life. 

Add screen shots (if possible) to the app folder and link then into this file with ![](<name>.png)

## Usage

Install the app and configure the settings to your liking. And your all good.

Apps that are not patched will still work but might have issues depending on how they function. Things that only listen for HRM events like watch faces will work without modification however things that need to control when they get HRM values will need to be patched to check for and use the global HRM values instead of obtaining their own values directly.

The HRM sensor enable function is over written by this app to prevent other apps from enabling the HRM sensor. This functionality can be disabled for compatibility reasons if you would like however this will defeat the purpose of this app which is power savings from tighter controls on the HRM values.

The following code snip-it will do that.
```javascript
// Global HRM Check
if (typeof global.hrm !== 'undefined') {
  console.log(`${global.hrm.bpm}, ${global.hrm.confidence}`);
}
// No global HRM
else {
  Bangle.setHRMPower(true, "test");
  function _get_HRM(data) {
    if (data.confidence > 80) {
      console.log(`${global.hrm.bpm}, ${global.hrm.confidence}`);
      Bangle.setHRMPower(false, "test");
    }
  }
  Bangle.on('HRM',_get_HRM);
}
```

#### Creator
Sleuth56 ([github](https://github.com/sleuth56))

#### Attributions
The app icon is downloaded from [https://icons8.com](https://icons8.com).

#### License
[MIT License](LICENSE)
