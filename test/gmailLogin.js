// Generated by Selenium IDE
const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');
const { expect } = require('chai');


describe('NewUserRequest', function() {
	this.timeout(100000);
	let driver;
	let vars;
	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}
	async function waitForWindow(timeout = 2) {
		await driver.sleep(timeout);
		const handlesThen = vars['windowHandles'];
		const handlesNow = await driver.getAllWindowHandles();
		if (handlesNow.length > handlesThen.length) {
			return handlesNow.find(handle => (!handlesThen.includes(handle)));
		}
		throw new Error('New window did not appear before timeout');
	}
	
	beforeEach(async function() {
		driver = await new Builder().forBrowser('chrome').build();
		vars = {};
	});
	afterEach(async function() {
		// await driver.quit();
   
	});

	it('NewUserRequest', async function() {
		console.log('Test name: NewUserRequest');
		console.log(' Step # | name | target | value');
		console.log('1 | open | https://sandbox.hollaex.com/signup | ');
		await driver.get('https://sandbox.hollaex.com/signup');
		const title = await driver.getTitle();
		console.log(title);
		expect(title).to.equal(title);
		console.log('entring sand box');
		console.log(' Step # | action | target | value');
		console.log('2 | setWindowSize | 1050x660 | ');
		await driver.manage().window().setRect(1050, 660);
     
		console.log('3 | type | name=email | youremail@gmail.com');
		await driver.wait(until.elementLocated(By.name('email')), 5000);
		await driver.findElement(By.name('email')).clear();
		await driver.findElement(By.name('email')).sendKeys('47b2obbitholla@gmail.com');
     
		console.log('4 | type | name=password | yourpassword!');
		await driver.findElement(By.name('password')).clear();
		await driver.findElement(By.name('password')).sendKeys('Holla2021!');
      
      
		console.log('5 | type | name=password_repeat | your password again!');
		await driver.findElement(By.name('password_repeat')).clear();
		await driver.findElement(By.name('password_repeat')).sendKeys('Holla2021!');
      
		console.log('6 | click | name=terms |'); 
		await driver.findElement(By.name('terms')).click();
      
		console.log('7 | click | css=.holla-button |'); 
		await driver.wait(until.elementIsEnabled(await driver.findElement(By.css('.holla-button'))), 50000);
		await driver.findElement(By.css('.holla-button')).click();
		await driver.executeScript('window.scrollTo(0,0)');
      
		console.log('8 | assertText | css=.icon_title-text | Email Sent');
		console.log('9 | waitForElementPresent | css=.icon_title-text | 5');
      
		await driver.wait(until.elementLocated(By.css('.icon_title-text')), 5000);
		await console.log(await driver.findElement(By.css('.icon_title-text')).getText());
		// expect(await driver.findElement(By.css(".icon_title-text")).getText()).to.equal("Email Sent");
     
		console.log('Test name: New User Email Confirmation');
		console.log('Step # | name | target | value');
		console.log('1 | open | /ServiceLogin/signinchooser?service=mail&passive=true&rm=false&continue=https%3A%2F%2Fmail.google.com%2Fmail%2Fh%2Fwcro9khk6y0j%2F&ss=1&scc=1&ltmpl=default&ltmplcache=2&emr=1&osid=1&flowName=GlifWebSignIn&flowEntry=ServiceLogin |'); 
		await driver.get('https://accounts.google.com/ServiceLogin/signinchooser?service=mail&passive=true&rm=false&continue=https%3A%2F%2Fmail.google.com%2Fmail%2Fh%2Fwcro9khk6y0j%2F&ss=1&scc=1&ltmpl=default&ltmplcache=2&emr=1&osid=1&flowName=GlifWebSignIn&flowEntry=ServiceLogin');
      
		console.log('2 | setWindowSize | 1050x660 | ');
		await driver.manage().window().setRect(1050, 660);
      
		console.log('3 | type&Enter | id=identifierId | youremail@gmail.com');
		await driver.findElement(By.id('identifierId')).sendKeys('yourgamil@gmail.com');
		await driver.findElement(By.id('identifierId')).sendKeys(Key.ENTER);
    
		console.log('4 | wait | name=password | Holla2021!');
		await driver.wait(until.elementsLocated(By.name('password'),30000,'wait', 5000));
		console.log('sleep well for 10');
		await sleep(5000);
      
		console.log('5 | type&Enter | id=password| your password!');
		await driver.findElement(By.name('password')).sendKeys('yourpassword');
		await driver.findElement(By.name('password')).sendKeys(Key.ENTER);
      
		console.log('sleep well for 5');
		await sleep(5000);
      
		console.log('6 | click | linkText=Refresh | ');
		await driver.findElement(By.linkText('Refresh')).click();
      
		console.log('7 | click | css=.ts | ');
		await driver.findElement(By.css('.ts')).click();
		await driver.findElement(By.css('.h td')).click();
     
		console.log(' 8 | assertText | css=h2 b | sandbox Sign Up');
		expect(await driver.findElement(By.css('h2 b')).getText()).to.equal('sandbox Sign Up');
		console.log(' 9 | click | css=button | ');
		vars['windowHandles'] = await driver.getAllWindowHandles();
		console.log('10 | selectWindow | handle=${win9509} | ');
		await driver.findElement(By.css('button')).click();
		console.log(' 11 | click | css=.icon_title-wrapper | ');
		vars['win9509'] = await waitForWindow(5000);
		console.log('12 | assertNotText | css=.icon_title-text | Error');
		await driver.switchTo().window(vars['win9509']);
		await driver.findElement(By.css('.icon_title-wrapper')).click();
		{
			const text = await driver.findElement(By.css('.icon_title-text')).getText();
			expect(text).to.not.equal('Error');
		}
      
  
	});
	it('NewUserRequest', async function() {
		driver = await new Builder().forBrowser('chrome').build();
		await sleep(10000);
		console.log('Test name: New User Email Confirmation');
		console.log('Step # | name | target | value');
		console.log('1 | open | /ServiceLogin/signinchooser?service=mail&passive=true&rm=false&continue=https%3A%2F%2Fmail.google.com%2Fmail%2Fh%2Fwcro9khk6y0j%2F&ss=1&scc=1&ltmpl=default&ltmplcache=2&emr=1&osid=1&flowName=GlifWebSignIn&flowEntry=ServiceLogin |'); 
		await driver.get('https://accounts.google.com/ServiceLogin/signinchooser?service=mail&passive=true&rm=false&continue=https%3A%2F%2Fmail.google.com%2Fmail%2Fh%2Fwcro9khk6y0j%2F&ss=1&scc=1&ltmpl=default&ltmplcache=2&emr=1&osid=1&flowName=GlifWebSignIn&flowEntry=ServiceLogin');

		console.log('2 | setWindowSize | 1050x660 | ');
		await driver.manage().window().setRect(1050, 660);

		console.log('3 | type&Enter | id=identifierId | youremail@gmail.com');

		await driver.findElement(By.id('identifierId')).sendKeys(userName);
		await sleep(10000);
		await driver.findElement(By.id('identifierId')).sendKeys(Key.ENTER);

		console.log('4 | wait | name=password | Holla!');
		await driver.wait(until.elementsLocated(By.name('password'),30000,'wait', 5000));
		console.log('sleep well for 10');
		await sleep(5000);

		console.log('5 | type&Enter | id=password| your password!');
		await driver.findElement(By.name('password')).sendKeys(passWord);
		await driver.findElement(By.name('password')).sendKeys(Key.ENTER);

		console.log('sleep well for 5');
		await sleep(5000);

		console.log('6 | click | linkText=Refresh | ');
		await driver.findElement(By.linkText('Refresh')).click();

		console.log('7 | click | css=.ts | ');
		await driver.findElement(By.css('.ts')).click();
		await driver.findElement(By.css('.h td')).click();

		assert(await driver.findElement(By.css('h2 b')).getText() == 'sandbox Reset Password Request');
		console.log(' 6 | click | css=.gmail_attr | ');
		await driver.findElement(By.css('.gmail_attr')).click();
		console.log(' 7 | click | css=button | ');
		vars['windowHandles'] = await driver.getAllWindowHandles();
		console.log(' 8 | selectWindow | handle=${win3601} | ');
		await driver.findElement(By.css('button')).click();
		console.log(' 9 | type | name=password | password!');
		vars['win3601'] = await waitForWindow(2000);
		console.log(' 10 | type | name=password_repeat | password');
		await driver.switchTo().window(vars['win3601']);
	});

});