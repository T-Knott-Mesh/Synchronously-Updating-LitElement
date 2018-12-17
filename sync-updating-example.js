import { html, LitElement } from "@polymer/lit-element";
import "@polymer/paper-button";
import "@polymer/paper-progress";

/**
 * `sync-updating-example`
 * This is an element that demonstrates the pitfalls and workarounds of Synchronous Rendering in a LitElement
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 *
 * @author
 * Tsavo van den Berg, Knott
 *
 * @description
 * The point of this example is to show two updating patterns, one async (The default lit element behavior) the other sync, forced through micro-task-ish timing
 *
 */

class SyncUpdatingExample extends LitElement {
	render() {
		return html`
			<style>
				:host {
					display: flex;
					flex-flow: column nowrap;
					justify-content: center;
					align-items: center;
				}

				div {
					display: flex;
					flex-flow: column nowrap;
					justify-content: space-around;
					align-items: center;
					width: 100%;
					height: 200px;
					border: 3px solid #f3f5f6;
					border-radius: 7px;
				}

				h5 {
					font-family: sans-serif;
				}

				#reset {
					background-color: #212121;
					color: #fff;
					margin: 20px auto;
				}
			</style>

			<div>
				<h5>Successful Synchronous Update ${Math.floor((this.successfulProgress / this.totalProgress) * 100)}%</h5>
				<paper-button
					raised
					@click="${
						_ => {
							this.runSuccessfulSynchronousTest();
						}
					}"
					>Run Test</paper-button
				>
				<paper-progress .value="${this.successfulProgress}" .max="${this.totalProgress}"></paper-progress>
			</div>

			<div>
				<h5>Failing Synchronous Update ${Math.floor((this.failingProgress / this.totalProgress) * 100)}%</h5>
				<paper-button
					raised
					@click="${
						_ => {
							this.runFailingSynchronousTest();
						}
					}"
					>Run Test</paper-button
				>
				<paper-progress .value="${this.failingProgress}" .max="${this.totalProgress}"></paper-progress>
			</div>

			<paper-button
				id="reset"
				@click="${
					_ => {
						this.synchronousProgressUpdates = 0;
						this.failingProgressUpdates = 0;
						this.successfulProgress = 0;
						this.failingProgress = 0;
					}
				}"
				>Reset all tests</paper-button
			>
		`;
	}

	async runSuccessfulSynchronousTest() {
		var i;
		for (i = 0; i <= this.totalProgress; i++) {
			//Either one works here
			//Personally I like the setTimeout more, it seems to be less computationally expensive than RAF
			await new Promise(resolve => setTimeout(_ => resolve(), 1));
			//uncomment to test out RAF timing
			// await new Promise(resolve => requestAnimationFrame(_ => resolve()));
			this.successfulProgress = i;
		}

		await this.updateComplete;
		//Subtract one here as the final update comes after the final increase to successfulProgress
		alert(`Successful Progress Updated ${this.synchronousProgressUpdates - 1} Times `);
	}

	async runFailingSynchronousTest() {
		var i;
		for (i = 0; i <= this.totalProgress; i++) {
			console.log("should have updated");
			this.failingProgress = i;
			//Even Manually Requesting the update here fails
			this.requestUpdate("failingProgress");
		}

		await this.updateComplete;
		//Subtract one here as the final update comes after the final increase to failingProgress
		alert(`Failing Progress Updated ${this.failingProgressUpdates - 1} Times `);
	}

	static get properties() {
		return {
			successfulProgress: {
				type: Number
			},
			totalProgress: {
				type: Number
			}
		};
	}

	constructor() {
		super();
		this.successfulProgress = 0;
		this.failingProgress = 0;
		this.totalProgress = 1000;
		this.synchronousProgressUpdates = 0;
		this.failingProgressUpdates = 0;
	}

	updated(changed) {
		if (changed.has("successfulProgress")) {
			this.synchronousProgressUpdates++;
			console.log(this.successfulProgress);
		}

		if (changed.has("failingProgress")) {
			this.failingProgressUpdates++;
			console.log(this.failingProgressUpdates);
		}
	}
}

window.customElements.define("sync-updating-example", SyncUpdatingExample);
