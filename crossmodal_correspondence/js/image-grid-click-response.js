/*
sample trial:
let grid_trial = {
	image: [img1.jpg, img2.jpg, img3.jpg, img4.jpg, img4.jpg, img6.jpg],
	prompt: null,
	response_ends_trial: true,
	randomize_grid: true,
	image_size: [250,250],
	grid_size: [2,3],
	image_padding: 10,
	audio: [file1.wav, file2.wav],
	replay_key: "P",
	max_replays: false
	}
 */


/**
 * I use a library throughout this document called jQuery. It is the greatest ratio of easy to powerful I've
 * ever seen, and afaic it's the gold standard for all javascript. Whereever you see $(...) notation,
 * this is jQuery. It's optional, it doesn't do a single thing you can google and write in vanilla JS, but,
 * if you want to pick it up, it will make literally everything easier and more elegant.
 * jQuery needs to be added to your document, however, if you wish to use my utilities.js file, because *it* uses
 * jQuery. So, in your index.html file, in the <head>, make sure jQuery is loaded *first*, then utilities.js and then
 * jsPsych and whatever else  you care to add.
 *
 * Again, nothing I achieve with jQuery can't be otherwise, and I'll explain it's use throughout, but just don't
 * be alarmed at syntax you've not yet seen. But in particular I use jQuery to generate HTML, so where jsPsych does this:
 *
 * var stimulus = "<div style='width:100, height: 100'>" +  [js doesn't allow multi-line strings without an operator
 *               "<p class='fixaton'>+</p>" +
 *               "</div>";
 *
 * jQuery would achieve this like this:
 *
 * var stimulus =  $("<div />").css({width: 100, height: 100})
 *                             .append(
 *                                  $("<p />").addClass('fixation')
 *                                            .html("+")
 *                              )
 *  })
 *
 *  Which may look much more verbose, but, if you live in this world, eventually appears much more sane. Utterly irrelevant
 *  how you do it, just explaining myself so you can follow.
 */

// so we're adding our new plug-in to jsPsych's library so it's made available when jsPsych.init() is called
jsPsych.plugins["image-grid-click-response"] = (function () {

	// declare an empty object that will become our finalized plug-in
	let plugin = {};

	plugin.one_dva = 10; // an arbitary number of pixels to represent 1dva. All measurements must use this scale

	// we want to pre-load media; the arguments here are plug-in name, plug-in parameter, media-type
	jsPsych.pluginAPI.registerPreload('image-grid-click-response', 'images', 'image');
	jsPsych.pluginAPI.registerPreload('image-grid-click-response', 'audio', 'audio');

	/** There are some required parameters, some common ones, and then whatever you want for your context; the jsPsych
	 * tutorial on plug-in construction and the mydriad plug-in samples provided should give you enough to crib from.
	 *
	 * BUT. The "type" property is confusing; note, for example, that plugin.info.parameters.image.type says "IMAGE",
	 * but the default value is an empty array. The 'type' property doesn't refer to the type of the variable passed
	 * when configuring this plug-in (top of this document has a sample config), but rather the type of the elements
	 * provided in the passed container, so, an array of images or an image would both satisfy the type constraint,
	 * as would an anonymous function that returned either of those; line 1048 of jspsych.js has all data types listed
	 */

	plugin.info = {
		name: 'image-grid-click-response',
		parameters: {
			image: {
				type: jsPsych.plugins.parameterType.IMAGE,
				pretty_name: 'Images',
				default: [],
				description: 'An array of images to be arranged in a grid.'
			},
			prompt: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'Prompt',
				default: null,
				description: 'Any content here will be displayed below the stimulus.'
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
				default: {key: "P", instructions: "Press P to replay audio"},
				description: 'Allows for audio to be replayed, and configures the context for this.',
			},
			confirm_key: {
				type: jsPsych.plugins.parameterType.STR,
				pretty_name: "Selection Confirmation Key",
				default: null,
				description: 'Allows user to signal that they wish to confirm their selection.',
			},

			/**
			 * All of these were just arbitrarily added for use in this plug-in; later, when you write the function
			 * that actually controls the flow of the timeline event this plug-in generates, these properties will all
			 * be available in a an object called 'trial' that is passed to the 'trial' method (which is required)
			 * of any plug-in. Take care to consider your data types and var names, here.
			 */
			randomize_grid: {
				type: jsPsych.plugins.parameterType.BOOL,
				pretty_name: 'Randomize Grid',
				default: true,
				description: 'Determines if images will be presented in a random arrangement each trial.'
			},
			image_metrics: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: 'Image Size',
				default: {width: 3.5, height: 3.5, border_width: 0.2, border_color: "white", padding: 0.2},
				description: 'Determines if images will be presented in a random arrangement each trial.'
			},
			grid_size: {
				type: jsPsych.plugins.parameterType.OBJECT,
				pretty_name: 'Grid Size',
				default: [3, 3],
				description: 'The number of columns and rows the grid should contain.'
			},
			post_response: {
				type: jsPsych.plugins.parameterType.FUNCTION,
				pretty_name: 'Post-response callback',
				default: null,
				description: "A function to execute after a response is made if response_ends_trial is false with trial_data as an argument."
			},
			cfg: {
				type: jsPsych.plugins.parameterType.COMPLEX,
				pretty_name: "Miscellaneous Configuration",
				default: {
					data_repo: null,
					one_dva: null,
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

	plugin.additional_styles = function (data) {
		// append any additional CSS from the cfg property to the head (they are be removed later)
		let additional_styles = "";
		for (selector in data) {
			additional_styles += `\t${selector} {\n`;
			for (property in data[selector]) {
				additional_styles += `\t\t${property}: ${data[selector][property]};\n`;
			}
			additional_styles += `\t}\n\n`;
		}

		$("head").attr("id", "additional_styles").append($("<style />").html(additional_styles));
	};

	plugin.generate_html_stimuli = function (display_element, replay_instructions) {
		// create grid element
		let container = $("<div />").addClass('image-grid-click-response-container');
		// generate grid
		for (let i = 0; i < plugin.grid_size[1]; i++) {
			let row = $("<div />").addClass('image-grid-click-response-row');

			if (i === 0) $(row).addClass('edge');
			if (i === plugin.grid_size[1] - 1) $(row).addClass('edge');

			for (let j = 0; j < plugin.grid_size[0]; j++) {
				let index = i * plugin.grid_size[0] + j;
				$(row).append(
					$("<div />").addClass('image-grid-click-response-item').data({
						file: plugin.images[i],
						index: index + 1,
					}).css('background-image', `url('${plugin.images[index]}')`)
				)
			}
			$(container).append(row);
		}
		$(container).on('click', ".image-grid-click-response-item", plugin.click_handler);
		// we add the grid to the display, start any accompanying audio files, and start timing
		$(display_element).append(container);

		$(display_element).append($("<p />").addClass('replay-instructions').html(replay_instructions));

		let instrux_x = parseInt((0.1 * window.innerWidth) - $(".replay-instructions").offset().left);
		let instrux_y = parseInt((0.1 * window.innerHeight) - $(".replay-instructions").offset().top);
		$(".replay-instructions").css('transform', `translate(-${instrux_x}px, -${instrux_y}px`);
	};

	plugin.keypress_handler = function (event) {
		let key = String.fromCharCode(event.which);
		if (key === plugin.replay_key) {
			plugin.play_tone();
			plugin.replay_count++;
			return;
		}
		selected = $(".image-grid-click-response-item.selected")[0];
		pr(selected, 'sel');
		if (key === plugin.confirm_key && selected) {
			let data_temp = copy(plugin.data_template);
			data_temp.rt = performance.now() - plugin.start;
			data_temp.choice_file =  $(selected).data('file').split("/")[1];
			data_temp.choice_index = $(selected).data('index');
			data_temp.trial_type = "association";
			plugin.end_trial(data_temp);
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


	plugin.click_handler = function (e) {
		e.stopPropagation();

		if (!$(this).hasClass('selected')) {
			// first we remove the class from all grid items in case the user is changing their mind—we don't want
			// multiple grid elements selected for confirmation
			$(".image-grid-click-response-item").removeClass('selected');

			// then we add the 'selected' class to the current grid element
			$(this).addClass("selected");
		}
	};


	plugin.init_audio = function () {
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


	plugin.trial = function (display_element, trial) {
		// ensure grid is possible
		if (trial.image.length / trial.grid_size[0] != trial.grid_size[1]) {
			// for the love of fucking god, try to provide informative error messages
			throw 'The number of images provided cannot be arranged into the described grid.'
		}


		// plugin.grid_height = trial.grid_size[1] * trial.image_metrics.height;
		plugin.grid_size = trial.grid_size;
		plugin.tone = trial.audio;
		plugin.images = array_shuffle(trial.image);
		plugin.replay_count = 0;
		plugin.replay_key = trial.replay_cfg.key;
		plugin.confirm_key = trial.confirm_key;
		plugin.tone_playing = false;
		plugin.one_dva = trial.cfg.one_dva;
		plugin.data_repo = trial.cfg.data_repo;
		plugin.data_template = trial.cfg.data_template;

		$('#jspsych-loading-progress-bar-container').remove();

		/**
		 * Add style element to head for providing CSS to grid without inline fucking styles lololol; don't even read
		 * this, just load index.html in your browser and view source; reading the the computed consequence of this is
		 * much more ledgible, writing plain html in js is like writing an essay with a pencil sharpener instead of a
		 * pencil ffs; in any case, this is just the CSS the plug-in uses, jsPsych always puts the styling directly
		 * in the element, which everyone, everywhere, should find personally insulting
		 */

		$("head").append(
			$("<style />").attr('id', 'image-grid-response-styles').html(
				`body {\n` +
				`\twidth:${window.innerWidth}px;\n` +
				`\theight:${window.innerHeight}px;\n` +
				`}\n` +
				`.image-grid-click-response-container {\n` +
				`\tbox-sizing: border-box;\n` +
				`\tpadding: 0;\n` +
				`\tmargin:0;\n` +
				`\t}\n` +
				`.image-grid-click-response-item {\n` +
				`\twidth: ${plugin.one_dva * trial.image_metrics.width}px;\n` +
				`\theight: ${plugin.one_dva * trial.image_metrics.height}px;\n` +
				`\tbackground-repeat: no-repeat;\n` +
				`\tbackground-position: center;\n` +
				`\tbackground-size: contain;\n` +
				`\tdisplay: inline-block;\n` +
				`\tbox-sizing: border-box;\n` +
				`\tborder: ${plugin.one_dva * trial.image_metrics.border_width}px solid rgba(0,0,0,0);\n` +
				`\tpadding: ${plugin.one_dva * trial.image_metrics.padding}px;\n` +
				`}\n` +
				`.image-grid-click-response-item:last-of-type {\n` +
				`\tmargin-right: 0;\n` +
				`}\n` +
				`.image-grid-click-response-item.selected {\n` +
				`\tborder: ${plugin.one_dva * trial.image_metrics.border_width}px solid ${trial.image_metrics.border_color};\n` +
				`}\n` +
				`.image-grid-click-response-row {\n` +
				`\tmargin-bottom: ${plugin.one_dva * trial.image_metrics.padding}px;\n` +
				`}\n` +
				`.image-grid-click-response-row:last-of-type {\n` +
				`\tmargin-bottom: 0;\n` +
				`}\n` +
				`.replay-instructions {` +
				`\tfont-size: ${window.innerHeight * 0.025}px;` +
				`\tposition: fixed;\n` +
				`\tbottom: 50px;\n` +
				`\tleft: 50px;\n` +
				`\tcolor: white;\n` +
				`}`
			)
		);

		// append any additional CSS from the cfg property to the head (they are be removed later)
		plugin.additional_styles(trial.cfg.additional_styles);

		// generate and attach HTML elements
		plugin.generate_html_stimuli(display_element, trial.replay_cfg.instructions);

		// configure jsPsych's audio context
		plugin.init_audio();

		// do this once automatically for every trial that uses a tone
		plugin.play_tone();

		// add handler to replay audio if audio.replayable is true
		$("body").keydown(plugin.keypress_handler);

		// start timing
		plugin.start = performance.now();


		plugin.end_trial = function (trial_data) {
			// it's justa a best-jsPsychic-practice to do this at the end of every trial
			jsPsych.pluginAPI.clearAllTimeouts();

			/**
			 * Here we're adding each image's position as a column to the data. we could have done this earlier, it's
			 * a matter of taste, but those of you familiar with my code will appreciate how valuable I feel being rig-
			 * orous about the semantics one's code is, haha
			 *
			 */
			let img_strings = [];
			for (let i = 0; i < plugin.images.length; i++) {
				img_strings.push(plugin.images[i].split("/")[1])
			}
			trial_data.grid_sequence = img_strings.join(", ");

			// clear the <body> tag
			display_element.innerHTML = ''; // or, if you like, $(display_element).html('');

			/** remove the arbitrary styling we injected to the document head to avoid name collisions; in reality
			 * this is astronomically unlikely to happen because the CSS class names are so verbose, but it's best
			 * practice,
			 */
			$("#image-grid-response-styles").remove();
			$("#additional-styles").remove();

			plugin.audio_context = null;
			pr(trial_data, "FINAL DATAZ");
			data_repo.push(trial_data);

			// log that shit and  move on to the next trial
			jsPsych.finishTrial(trial_data);
		};

	};

	return plugin;

})();

