/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { SpectronApplication } from '../../spectron/application';
import { ProblemSeverity, Problems } from '../problems/problems';

describe('CSS', () => {
	let app: SpectronApplication;
	before(() => { app = new SpectronApplication(); return app.start(); });
	after(() => app.stop());
	beforeEach(function () { app.createScreenshotCapturer(this.currentTest); });

	it('verifies quick outline', async () => {
		await app.workbench.quickopen.openFile('style.css');
		const outline = await app.workbench.editor.openOutline();
		const elements = await outline.getQuickOpenElements();
		app.screenshot.capture('CSS Outline result');
		assert.equal(elements.length, 2, `Did not find two outline elements`);
	});

	it('verifies warnings for the empty rule', async () => {
		await app.workbench.quickopen.openFile('style.css');
		await app.client.waitForElement(`.monaco-editor.focused`);
		await app.client.type('.foo{}');

		let warning = await app.client.waitForElement(Problems.getSelectorInEditor(ProblemSeverity.WARNING));
		app.screenshot.capture('CSS Warning in editor');
		assert.ok(warning, `Warning squiggle is not shown in 'style.css'.`);

		await app.workbench.problems.showProblemsView();
		warning = await app.client.waitForElement(Problems.getSelectorInProblemsView(ProblemSeverity.WARNING));
		app.screenshot.capture('CSS Warning in problems view');
		assert.ok(warning, 'Warning does not appear in Problems view.');
		await app.workbench.problems.hideProblemsView();
	});

	it('verifies that warning becomes an error once setting changed', async () => {
		await app.workbench.settingsEditor.addUserSetting('css.lint.emptyRules', '"error"');
		await app.workbench.quickopen.openFile('style.css');
		await app.client.type('.foo{}');

		let error = await app.client.waitForElement(Problems.getSelectorInEditor(ProblemSeverity.ERROR));
		app.screenshot.capture('CSS Error in editor');
		assert.ok(error, `Warning squiggle is not shown in 'style.css'.`);

		const problems = new Problems(app);
		await problems.showProblemsView();
		error = await app.client.waitForElement(Problems.getSelectorInProblemsView(ProblemSeverity.ERROR));
		app.screenshot.capture('CSS Error in probles view');
		assert.ok(error, 'Warning does not appear in Problems view.');
		await problems.hideProblemsView();
	});
});