
jsPsych.plugins["multimedia-discrimination-slider"] = (function() {
	// declare an empty object that will become our finalized plug-in
	let plugin = {};

	// we want to pre-load media; the arguments here are plug-in name, plug-in parameter, media-type
	jsPsych.pluginAPI.registerPreload('multimedia-discrimination-slider', 'images', 'image');
	jsPsych.pluginAPI.registerPreload('multimedia-discrimination-slider', 'audio', 'audio');

	plugin.info = {
		name: 'multimedia-discrimination-slider',
		parameters: {
			image: {
				type: jsPsych.plugins.parameterType.IMAGE,
				pretty_name: 'Images',
				default: [],
				description: 'An pair of images to be presented adjacent one and other.'
			},
			audio: {
				type: jsPsych.plugins.parameterType.AUDIO,
				pretty_name: "Audio Files",
				default: null,
				description: 'Audio files, if any, to accompany grid.',
			},
			replay_cfg: {
				type: jsPsych.plugins.parameterType.COMPLEX,
				pretty_name: "Audio Replay Config",
				default: {allow: true, key: "P", instructions: "Press P to replay audio", max_replays: false},
				description: 'Allows for audio to be replayed, and configures the context for this.',
			},
			image_metrics: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: 'Image Size',
				default: {width: 3.5, height: 3.5, border_width: 0.2, border_color: "white", padding: 0},
				description: 'Determines if images will be presented in a random arrangement each trial.'
			},
			evaluations: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: "Evaluations",
				default: null,
				description: "An pair of descriptors to flank sliders, or an array of such pairs."
			},
			post_response: {
				type: jsPsych.plugins.parameterType.FUNCTION,
				pretty_name: 'Post-response callback',
				default: null,
				description: "A function to execute after a response is made if response_ends_trial is false with trial_data as an argument."
			},
			confirm_cfg: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: "Response confirmation configuration",
				default: {allow: true, key: "P", instructions: "Press P to replay audio", max_replays: false},
				description: "Information about which keypress confirms a choice and features thereof."
			},
			cfg: {
				type: jsPsych.plugins.parameterType.COMPLEX,
				pretty_name: "Miscellaneous Configuration",
				default: {
					data_repo: null,
					one_dva: null,
					dva_mgr: null,
					additional_styles: {
						body: {
							"background-color": "rgb(45,45,48,255)",
							"font-family": "sans-serif",
							color: "white"
						}
					},

				},
				description: "A suite of configuration options for granular control of trial set-up."
			}
		}
	};


	plugin.init_audio = function() {
		// configure jsPsych's audio context
		plugin.audio_context = jsPsych.pluginAPI.audioContext();
		if (plugin.audio_context !== null) {
			var source = plugin.audio_context.createBufferSource();
			source.buffer = jsPsych.pluginAPI.getAudioBuffer(plugin.tone);
			source.connect(plugin.audio_context.destination);
		} else {
			var audio = jsPsych.pluginAPI.getAudioBuffer(plugin.tone);
			audio.currentTime = 0;
		}

	};

	plugin.play_tone = function () {
		if (plugin.audio_context !== null && !plugin.tone_playing) {

			plugin.audio_context.currentTime = 0;
			var source = plugin.audio_context.createBufferSource();
			source.buffer = jsPsych.pluginAPI.getAudioBuffer(plugin.tone);
			source.connect(plugin.audio_context.destination);
			source.start(0);
			plugin.tone_playing = true;
			source.onended = function () {
				plugin.tone_playing = false;
			}
		}
	};

	plugin.update_slider = function() {
		plugin.slider_interaction_occurred = false;
		let labels = plugin.labels.pop();
		$("#slider-label-left > span").html(labels[0]);
		$("#slider-label-left").data('label', labels[0]);
		$("#slider-label-right > span").html(labels[1]);
		$("#slider-label-right").data('label', labels[1]);
		// reset the notch
		$("#slider-notch").css("left", parseInt(0.5 * $("#slider-track").width()));
	};


	plugin.additional_styles = function(data) {
		// append any additional CSS from the cfg property to the head (they are be removed later)
		let additional_styles = "";
		for (selector in data) {
			additional_styles += `\t${selector} {\n`;
			for (property in data[selector]) {
				additional_styles += `\t\t${property}: ${data[selector][property]};\n`;
			}
			additional_styles += `\t}\n\n`;
		}

		$("head").append( $("<style />").attr("id", "additional_styles").html(additional_styles) );
	};


	plugin.generate_html_stimuli = function(display_element) {
		let container = $("<div />");

		// depending on trial type, we add an image or load a tone
		if (plugin.image) {
			// generate image pair and attach to container
			$(container).append( $("<div />").attr('id', 'image-trial').data('file', plugin.image).css('background-image', `url('${plugin.image}')`) );
		} else { // ... or else we create the audio context
			plugin.init_audio();
			// we need to provide visual instructions at the bottom of the screen about replaying tones
		}


		// create the html stimuli; first we create the slider and it's label elements (but populate them later)
		$(container).append(
			// generate sider and attach to container
			$("<div />").addClass('slider-wrapper').append([
				$("<div />").attr("id", "slider-label-left").addClass("slider-label left").append(
					$("<span />")
				),
				$("<div />").addClass("slider-track-wrapper").append([
					$("<div />").attr('id', 'slider-track'),
					$("<div />").attr('id', 'slider-notch')
				]),
				$("<div />").attr("id", "slider-label-right").addClass("slider-label right").append(
					$("<span />")
				),
			])
		);
		// finally we add all the trial stimuli to the display
		$(display_element).append(container);
		$(display_element).append($("<p />").attr('id', 'replay-instrux').addClass('replay-instructions').html(plugin.instructions));
		let instrux_x = parseInt(25 - $(".replay-instructions").offset().left);
		let instrux_y = parseInt(window.innerHeight - $(".replay-instructions").offset().top - (25 + $(".replay-instructions").height()));

		$("#replay-instrux").css('transform', `translate(${instrux_x}px, ${instrux_y}px`);
	};


	plugin.replay_handler = function() {
		plugin.replay_count++;
		if (plugin.audio_context !== null && !plugin.tone_playing){

			plugin.audio_context.currentTime = 0;
			var source = plugin.audio_context.createBufferSource();
			source.buffer = jsPsych.pluginAPI.getAudioBuffer(plugin.tone);
			source.connect(plugin.audio_context.destination);
			source.start(0);
			plugin.tone_playing = true;
			source.onended = function() {
				plugin.tone_playing = false;
			}
		}
	};


	plugin.confirmation_handler = function() {
		let slider_width = $("#slider-track").width();
		let notch_offset = $('#slider-label-right').offset().left - $('#slider-notch').offset().left;
		plugin.data_template[`left_label_${plugin.labels_shown}`] = $("#slider-label-left").data('label');
		plugin.data_template[`right_label_${plugin.labels_shown}`] = $("#slider-label-right").data('label');
		plugin.data_template[`rt_${plugin.labels_shown}`] = performance.now() - plugin.start;
		plugin.data_template[`response_${plugin.labels_shown}`] = (slider_width - notch_offset) / slider_width;
		plugin.data_template.img = plugin.image ? plugin.image.split("/")[1] : null;
		if (plugin.image)  pr([plugin.image, plugin.image.split("/")[1]], "imgz");
		plugin.data_template.tone = plugin.tone ? plugin.tone.split("/")[1] : false;
		plugin.labels_shown++;
		// if not finished all evaluations, continue to the next one, else, finish the trial
		if (plugin.labels.length > 0) {
			// replace the slider labels with unevaluated labels
			plugin.update_slider();

			// (re)start timing
			plugin.start = performance.now();

			return true;
		}

		return false;
	};

	plugin.click_handler = function(e) {
		e.stopPropagation();
		plugin.slider_interaction_occurred = true; // they can change their answer, but we note that they made one

		$("#slider-notch").css("left", `${Math.floor((e.pageX - $("#slider-track").offset().left)) / plugin.dva_mgr.scale}px`);
	};




	plugin.trial = function(display_element, trial) {
		// declare trial-wide vars
		let trial_data = [];
		plugin.data_repo = trial.cfg.data_repo;

		// set global variables for the tone or image used in this trial
		plugin.image = trial.image.length ? trial.image[0] : false;
		plugin.tone = trial.audio.length ? trial.audio[0] : false;
		plugin.slider_interaction_occurred = false; // prevent user from spamming space bar and not answering
		plugin.tone_playing = false;
		// do the same for the slider labels after shuffling them
		plugin.labels = array_shuffle(trial.evaluations);
		plugin.labels_shown = 0;
		plugin.one_dva = trial.cfg.one_dva;
		plugin.dva_mgr = trial.cfg.dva_mgr;
		plugin.data_template = copy(trial.cfg.data_template);
		plugin.data_template.trial_type = "semantic";
		plugin.instructions = trial.confirm_cfg.instructions;
		plugin.replay_count = 0;
		$('#jspsych-loading-progress-bar-container').remove(); // fuck this thing, I can't get it to go away properly

		// add styles to the head for tidiness; these are removed when the trial ends
		$("head").append(
			$("<style />").attr('id', 'multi-pge-audio-image-slider-styles').html(
				`#image-trial {\n` +
				`\twidth: ${plugin.one_dva * trial.image_metrics.width}px;\n` +
				`\theight: ${plugin.one_dva * trial.image_metrics.width}px;\n` +
				`\tbackground-repeat: no-repeat;\n` +
				`\tbackground-position: center;\n` +
				`\tbackground-size: contain;\n` +
				// `\tmargin-right: ${plugin.one_dva * trial.image_metrics.padding}px;\n` +
				`\tdisplay: inline-block;\n` +
				`\tbox-sizing: border-box;\n` +
				`\tpadding: 0;\n` +
				`}\n\n` +
				`.replay-instructions {` +
				`\tposition: fixed;\n` +
				`\tbottom: 50px;\n` +
				`\tleft: 50px;\n` +
				`}`
			)
		);

		// add any extra CSS loaded in trial.cfg
		plugin.additional_styles(trial.cfg.additional_styles);

		// add the html stimuli to the DOM
		plugin.generate_html_stimuli(display_element);

		// now we attach handlers for clicking and key-presses; we start with key-presses
		$("body").keydown(function (event) {
			let key = String.fromCharCode(event.which);

			// handles key-presses for replaying the tone
			if ( key === trial.replay_cfg.key && trial.audio) plugin.replay_handler();

			// handles evaluation-completion key-press
			if (key === trial.confirm_cfg.key && plugin.slider_interaction_occurred) {
				// returns false when all labels have been evaluated
				let data = plugin.confirmation_handler();
	pr(data, "dataz?");
				if (data) {
					trial_data.push(data)
				} else {
					plugin.end_trial(trial_data);
				}
			}
		});

		// now we add a click-listener to the slider track that triggers a function to update the slider notch's location
		// note that we register the handler to the slider track *wrapper*; the track itself is very narrow and hard to
		// click, by targeting it's invisible wrapepr we can widen the click area without widening the track visibly
		$("body").on("click", ".slider-track-wrapper", plugin.click_handler);

		// this bit rather speaks for itself
		plugin.init_audio();

		// we add label to the slider just before starting
		plugin.update_slider();

		// do this once automatically for every trial that uses a tone
		plugin.play_tone();

		// and finally we start timing
		plugin.start = performance.now();


		plugin.end_trial = function(trial_data) {
				// it's just a a best-jsPsychic-practice to do this at the end of every trial
				jsPsych.pluginAPI.clearAllTimeouts();

				// clear the <body> tag
				display_element.innerHTML = ''; // or, if you like, $(display_element).html('');

				/** remove the arbitrary styling we injected to the document head to avoid name collisions; in reality
				 * this is astronomically unlikely to happen because the CSS class names are so verbose, but it's best
				 * practice,
				 */
				$("#multi-page-audio-image-slider-styles").remove();
				$("#additional-styles").remove();

				// click & key-press listeners are bound each trial and persist between them if not removed
				$("body").off();

				plugin.audio_context = null;
				// log that shit and  move on to the next trial
				plugin.data_template.replay_count = plugin.replay_count;
				pr(plugin.data_template, "dataz");
				pr(trial_data, "dataz");
				data_repo.push(plugin.data_template);

				jsPsych.finishTrial(trial_data);
			};
	};

	return plugin;
})();