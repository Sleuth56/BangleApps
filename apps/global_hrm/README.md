# Global HRM

This app creates a global variable that serves as a reference for apps to use instead of obtaining there own HRM values. This has the potential to greatly lower battery consumption. 

## Usage

Install the app and configure the settings to your liking. And your all good.

Apps that are not patched will still work but might have issues depending on how they function. Apps that only listen for HRM events like watch faces will work without modification however, apps that need to control the HRM sensor directly will need to check for and use the global HRM values instead of obtaining their own values.

The HRM sensor enable function is over written by this app to prevent other apps from enabling the HRM sensor. This functionality can be disabled for compatibility reasons if you would like however, this will defeat the purpose of this app.

The following snip-it of code is an example of how to patch an app to work with global hrm.
```javascript
// Global HRM Check
if (typeof global.hrm !== 'undefined' && global.hrm.enabled == true) {
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
