class DVAManager {
    // Find size, in deg, of the to-be-measured item as a function of its distance from the user
    reference = {
        object: {
            width: {
                px: null,
                degrees: null,
                radians: null,
                mm: 86
            }
        },
        element: {
            width: {
                initial: null,
                computed: null
            },
            height: {
                initial: null,
                computed: null
            },
            initial_margin: null,
        }
    };

    DOM = {
        reference: {
            box: null,
            resize_handle: null,
        },
        instructions: {
            box: null,
        }
    };

    one_dva = null;
    aspect_ratio = null;
    view_distance = 280; // mm, this is a constant
    scale = null;
    dragging = false;
    dragged = false;
    origin = {x: null, y: null};
    d_xy = {x: null, y: null};
    attempts = [];
    instructions = {
        initial: 'You will now perform the calibration task three times.',
        repeat_task: " of 3 calibrations completed. Press SPACE to continue.",
        restart_task: 'Please be more precise in matching the box size to the card you are holding. The calibration phase will begin again.'
    };

    presenting_instructions = false;
    styles = {
        "body": { "background-color": "rgb(45,45,48)"},
        "#reference-box": {
            "background-color": "white",
            "width": "50%",
            "height": "1%",
            "position": "relative",
            "display": "block",
            "margin": "7.5% auto",
            "border": "5px solid red",
            "box-sizing": "border-box"
        },
        "#reference-box-resize-handle": {
            "width": "25px",
            "height": "25px",
            "background-color": "rgba(100,165,255, .75)",
            "border": "6px solid rgb(0,0,255)",
            "box-sizing": "border-box",
            "border-radius": "99999px",
            "position": "absolute",
            "right": "-15px",
            "bottom": "-15px",
            "cursor": "nwse-resize"
        },
        "p": {
            width: "100%",
            "font-size": `${parseInt(window.innerHeight * 0.05)}px`,
            "margin-top": `${parseInt(0.5 * (window.innerHeight - (window.innerHeight * 0.05)))}px`,
            "text-align": "center",
            "color": "white",
            "font-family": "sans-serif"
        }
    };

    constructor() {
        //this.init()
    };

    init() {
        // this.instructions.repeat_task = `${3 - this.attempts.length} / 3 calibrations completed. Press SPACE to continue.`; // can't compute the value before constructor is called
        this.aspect_ratio = 85.6 / 54; // avg canadian credit card dimensions

        // Create html for display
        this.DOM.reference.box = $("<div />").attr('id', 'reference-box');
        this.DOM.reference.resize_handle = $("<div />").attr('id', 'reference-box-resize-handle');
        this.reference.object.width.radians = 2 * Math.atan((this.reference.object.width.mm / 2) / this.view_distance);
        this.reference.object.width.degrees = this.reference.object.width.radians * (180 / Math.PI);
        this.DOM.instructions = $("<div />").html(this.instructions);

        // // generate CSS & append to head
        let additional_styles = "";
        for (let selector in this.styles) {
            additional_styles += `\t${selector} {\n`;
            for (let property in this.styles[selector]) {
                additional_styles += `\t\t${property}: ${this.styles[selector][property]};\n`;
            }
            additional_styles += `\t}\n\n`;
        }
        $("head").append($("<style />").attr("id", "additional_styles").html(additional_styles));

        // attach the handle to the reference box
        $(this.DOM.reference.box).append(this.DOM.reference.resize_handle);

        //
        this.build_task();


        this.reference.element.width.initial = $(this.DOM.reference.box).width();
        this.reference.element.height.initial = $(this.DOM.reference.box).height();
        this.reference.element.initial_margin = $(this.DOM.reference.box).css('margin-top');
        $("body").on('keydown', null, {self: this}, this.apply);
        $("body").on('mousedown', "#reference-box-resize-handle", {self: this}, this.toggle_drag);
        $("body").on('mouseup', null, {self: this}, this.toggle_drag);
        // $("body").mousedown(this.DOM.reference.resize_handle, {self:this}, this.toggle_drag);
        $("body").on('mousemove', null, {self: this}, this.resize);
    };


    /**
     * Builds (and rebuild) the task elements and attaches them to the DOM after each attempt at resizing
     * @param resetting
     */
    build_task(resetting) {
        if (resetting) {
            $(this.DOM.reference.box).css({
                height: this.reference.element.height.initial,
                width: this.reference.element.width.initial,
                'margin-top': this.reference.element.initial_margin
            });
        }
        $("body").append($("<div />").attr('id', 'task-wrapper').append(this.DOM.reference.box));
        $(this.DOM.reference.box).css('height', `${$(this.DOM.reference.box).width() / this.aspect_ratio}px`);

        $(this.DOM.reference.box).css('margin-top', `${0.5 * (window.innerHeight - $(this.DOM.reference.box).height())}px`);
    }


    /**
     * Handles spacebar presses, basically, whether to advance the screen or confirm the task; calls launch (set by user
     * at run time) after three consecutive valid attempts are registered.
     * @param e
     */
    apply(e) {
        let self = e.data.self;
        if (String.fromCharCode(e.which) === " " && self.dragged) {
            if (self.attempts.length < 3) {
                if (!self.presenting_instructions) {
                    self.attempts.push($(self.DOM.reference.box).width() / self.reference.object.width.degrees);
                    // make sure no attempt is wildly inaccurate
                    if (self.attempts.length > 1) {
                        for (let i = 0; i < self.attempts.length - 1; i++) {
                            if (Math.abs(1 - self.attempts[i] / self.attempts[-1]) > 0.1) return self.restart();
                        }
                    }
                }
                self.reset();
            } else {
                $("body").off();
                self.scale = (self.attempts.reduce(sum) / 3.0) / self.one_dva;
                $("head").append(
                    $('<style />').html(
                        `\t.jspsych-display-element { \n` +
                        `\t\ttransform: scale(${self.scale})\n` +
                        `\t}\n\n` +
                        `\tp, a, span { \n` +
                        `\t\ttransform: scale(1.0)\n` +
                        `\t}`
                    )
                );
                // pull the CSS we added during init()
                $('#additional_styles').remove();
                self.launch();
            }
        }
    }

    /**
     * Called after each valid attempt, returns reference box to initial size; is iteratively called to pass between
     * instructions screens and task screens
     */
    reset() {
        // clear the body
        $("body").html('');

        // instructions and task alternate; whatever phase we were in, now we switch to the other
        if (!this.presenting_instructions) {
            $("body").append($("<p />").html(this.attempts.length + this.instructions.repeat_task));
            this.presenting_instructions = true;
        } else {
            this.dragged = false;
            this.presenting_instructions = false;
            this.build_task(true)
        }
    }

    /**
     * Only called if an attempt varies too greatly from previous attempts; completely restarts entire task.
     */
    restart() {
        this.attempts = [];
        this.dragged;
        $('body').html('');
        $('body').append($("<p />").html(this.instructions.restart_task));

        // the seriously-tho-don't-fuck-up message can't be avoided, it's just gonna be mad at you for 3 seconds.
        setTimeout(this.build_task(true), 3000);
    }

    /**
     * Listener to detect whether or not mouse activity should currently be considered "dragging"; bound to mouseup and
     * mousedown on the reference box's handle
     * @param e
     */
    toggle_drag(e) {
        let self = e.data.self;
        e.stopPropagation();
        e.preventDefault();
        self.dragging = e.type === "mousedown";
        if (self.dragging) {
            self.dragged = true; // just ensuring the user did this at least once
            self.origin.x = e.pageX;
            self.origin.y = e.pageY;
            self.reference.element.width.computed = Math.floor($(self.DOM.reference.box).outerWidth);
            self.reference.element.height.computed = Math.floor($(self.DOM.reference.box).outerHeight);
        }
    }

    /**
     * Handler for updating the reference box as it's handle is dragged
     * @param e
     */
    resize(e) {
        let self = e.data.self;
        if (self.dragging) {
            let window_x = window.innerWidth;
            let mouse_x = e.pageX;
            let reference_width = window_x - (2 * (window_x - mouse_x));
            let reference_height = Math.floor(reference_width / self.aspect_ratio);
            let margin = `${0.5 * (window.innerHeight - reference_height)}px`;
            $(self.DOM.reference.box).css({
                width: `${reference_width}px`,
                height: `${reference_height}px`,
                'margin-top': margin
            });

        }
    }

    tutorial() {
        // card 1: sit comfortably and in a posture that keeps your eyes the same distance from the screen for 60-90 minutes
        // card 2: roll up a sheet of paper into a tube the long way
        // card 3: Using the paper tube as a guide, position a standard credit or debit card between your eyes and the screen
        // card 4: in a moment a rectangle will appear on screen. the box will have a "handle", a red square in the bottom-right
        //         this handle can be used to resize the rectangle
        // card 5: close one eye. try to resize the rectangle to be precisely the width of the credit card as you perceive
        //         it. Only the red borders of the box should be visible
    }
}