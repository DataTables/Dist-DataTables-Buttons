import DataTables, { ApiButtonMethods, Dom, Context, Api, ColumnSelector, HeaderStructure } from 'datatables.net';
export { default } from 'datatables.net';

/*! Buttons for DataTables
 * Copyright (c) SpryMedia Ltd - datatables.net/license
 */

declare class Buttons {
    /**
     * Show / hide a background layer behind a collection
     *
     * @param show Flag to indicate if the background should be shown or
     *   hidden
     * @param className Class to assign to the background
     * @param fade Fade time
     * @param insertPoint Define the insert point
     */
    static background: (show: boolean, className?: string, fade?: number, insertPoint?: HTMLElement) => void;
    static buttons: Record<string, ButtonConfig | ButtonFunction>;
    /**
     * Instance selector - select Buttons instances based on an instance
     * selector value from the buttons assigned to a DataTable. This is only
     * useful if multiple instances are attached to a DataTable.
     *
     * @param group Instance selector - see `instance-selector` documentation on
     *   the DataTables site
     * @param Button instance array that was attached to the DataTables settings
     *   object
     * @return Buttons instances
     */
    static instanceSelector: (group: GroupSelector, buttons: ContextButtons[]) => Buttons[];
    /**
     * Button selector - select one or more buttons from a selector input so some
     * operation can be performed on them.
     * @param Button instances array that the selector should operate on
     * @param Button selector - see
     *   `button-selector` documentation on the DataTables site
     * @return Array of objects containing `inst` and `idx` properties of
     *   the selected buttons so you know which instance each button belongs to.
     */
    static buttonSelector: (insts: Buttons[], selector: ButtonSelector) => SelectedButtons[];
    /**
     * Default function used for formatting output data.
     *
     * @param str Data to strip
     */
    static stripData: (input: string | HTMLElement, config?: StripOptions) => string;
    /**
     * Provide a custom entity decoding function - e.g. a regex one, which can
     * be much faster than the built in DOM option, but also larger code size.
     *
     * @param fn
     */
    static entityDecoder: (fn: EntityDecoder) => void;
    /**
     * Set the pdfMake library for use with the pdfHtml5 button type
     *
     * @param _
     * @returns pdfMake library that is set
     */
    static pdfMake(_?: any): any;
    /**
     * Set the JSZip library for use with the excelHtml5 button type
     *
     * @param _
     * @returns JSZip library that is set
     */
    static jszip(_?: any): any;
    /**
     * Display (and replace if there is an existing one) a popover attached to a
     * button
     *
     * @param contentIn Content to show
     * @param hostButton DT API instance of the button
     * @param inOpts Options (see object below for all options)
     */
    popover(contentIn: HTMLElement | string | false, hostButton: ApiButtonMethods<any>, inOpts: PopoverOptions): void;
    /**
     * Common function for stripping HTML comments
     *
     * @param input
     * @returns
     */
    static stripHtmlComments: (input: string) => string;
    /**
     * Common function for stripping HTML script tags
     *
     * @param string input
     * @returns
     */
    static stripHtmlScript: (input: string) => string;
    /**
     * Buttons defaults. For full documentation, please refer to the docs/option
     * directory or the DataTables site.
     */
    static defaults: DefaultsButtons;
    /**
     * Version information
     */
    static version: string;
    /**
     * Get / set the action of a button
     * @param node Button element
     * @param action Function to set
     * @return Self for chaining
     */
    action(node: HTMLElement | Dom, action?: ButtonAction): this | ButtonAction;
    /**
     * Add an active class to the button to make to look active or get current
     * active state.
     *
     * @param node Button element
     * @param flag Enable / disable flag
     * @return Self for chaining or boolean for getter
     */
    active(node: HTMLElement | Dom, flag?: boolean): boolean | this;
    /**
     * Add a new button
     *
     * @param config Button configuration object, base string name or function
     * @param idx Button index for where to insert the button
     * @param draw Trigger a draw. Set a false when adding lots of buttons,
     *   until the last button.
     * @return Self for chaining
     */
    add(config: ButtonTypes, idx?: string | number, draw?: boolean): any;
    /**
     * Clear buttons from a collection and then insert new buttons
     */
    collectionRebuild(node: HTMLElement | Dom, newButtons: ButtonsList): void;
    /**
     * Get the container node for the buttons
     *
     * @return Buttons node
     */
    container(): Dom<HTMLElement>;
    /**
     * Disable a button
     * @param node Button node
     * @return Self for chaining
     */
    disable(node: HTMLElement | Dom): this;
    /**
     * Destroy the instance, cleaning up event handlers and removing DOM
     * elements
     * @return {Buttons} Self for chaining
     */
    destroy(): this;
    /**
     * Enable / disable a button
     *
     * @param node Button node
     * @param flag Enable / disable flag
     * @return Self for chaining
     */
    enable(node: HTMLElement | Dom, flag?: boolean): this;
    /**
     * Get a button's index
     *
     * This is internally recursive
     *
     * @param node Button to get the index of
     * @return Button index
     */
    index(node: HTMLElement, nested?: string, buttons?: ButtonSettings[]): string | null;
    /**
     * Get the instance name for the button set selector
     *
     * @return Instance name
     */
    name(): string;
    /**
     * Get a button's node of the buttons container if no button is given
     * @param node Button node
     * @return Button element, or container
     */
    node(node?: HTMLElement | Dom): Dom<HTMLElement>;
    /**
     * Set / get a processing class on the selected button
     *
     * @param node Triggering button node
     * @param flag true to add, false to remove, undefined to get
     * @return Getter value or this if a setter.
     */
    processing(node: HTMLElement | Dom, flag?: boolean): boolean | this;
    /**
     * Remove a button.
     *
     * @param node Button node
     * @return Self for chaining
     */
    remove(node: HTMLElement | Dom): this;
    /**
     * Get the text for a button
     *
     * @param node Button index
     * @return Button text
     */
    text(node: HTMLElement | Dom): string;
    /**
     * Set the text for a button
     *
     * @param node Button index
     * @param label Text to set
     * @return Buttons instance
     */
    text(node: HTMLElement | Dom, label: string | FunctionButtonText): Buttons;
    private c;
    private dom;
    private s;
    constructor(dtIn: Context | Api, configIn?: true | ConfigButtons | ButtonsList);
    /**
     * Add a new button to the key press listener
     * @param conf Resolved button configuration object
     */
    private _addKey;
    /**
     * Insert the buttons into the container. Call without parameters!
     *
     * @param container Recursive only - Insert point
     * @param buttons Recursive only - Buttons array
     */
    private _draw;
    /**
     * Create buttons from an array of buttons
     */
    private _expandButton;
    /**
     * Create an individual button
     *
     * @param config Resolved button configuration
     * @param inCollection `true` if a collection button
     * @param isSplit Is a split button
     * @param inSplit Is a part of a split button
     * @return {object} Completed button description object
     */
    private _buildButton;
    /**
     * Spin over buttons checking if splits should be enabled or not.
     * @param buttons Array of buttons to check
     */
    private _checkSplitEnable;
    /**
     * Check an array of buttons and see if any are enabled in it
     *
     * @param buttons Button array
     * @returns true if a button is enabled, false otherwise
     */
    private _checkAnyEnabled;
    /**
     * Get the button object from a node (recursive)
     *
     * @param node Button node
     * @param buttons Button array, uses base if not defined
     * @return Button object
     */
    private _nodeToButton;
    /**
     * Get container array for a button from a button node (recursive)
     * @param node Button node
     * @param buttons Button array, uses base if not defined
     * @return Button's host array
     */
    private _nodeToHost;
    /**
     * Handle a key press - determine if any button's key configured matches
     * what was typed and trigger the action if so.
     *
     * @param character The character pressed
     * @param e Key event that triggered this call
     */
    private _keypress;
    /**
     * Remove a key from the key listener for this instance (to be used when a
     * button is removed)
     *
     * @param conf Button configuration
     */
    private _removeKey;
    /**
     * Resolve a button configuration
     *
     * @param confIn Button config to resolve
     * @return Button configuration
     */
    private _resolveExtends;
}

declare module 'datatables.net' {
    interface Options {
        /**
         * Buttons extension options
         */
        buttons?: boolean | ConfigButtons | ButtonsList;
    }
    interface Defaults {
        /**
         * Buttons extension options
         */
        buttons?: boolean | ConfigButtons | ButtonsList;
    }
    interface ConfigLanguage {
        /**
         * Buttons language options
         */
        buttons?: ConfigButtonsLanguage;
    }
    interface Feature {
        buttons?: ConfigButtons | ButtonsList;
    }
    interface Api<T> {
        /**
         * Select a single button from the button instances attached to a
         * DataTable.
         *
         * @param groupSelector Button group (instance) selector. Provides the
         * ability to select a button from a specific instance of the Buttons
         * class.
         * @param buttonSelector Selector to obtain the button that should be
         * acted upon.
         */
        button: ApiButton<T>;
        buttons: ApiButtons<T>;
    }
    interface DataTablesStatic {
        /**
         * Buttons class
         */
        Buttons: typeof Buttons;
        /**
         * FileServer.js's `saveAs` function. Only present when buttons.html5 is
         * loaded.
         *
         * @param blob Data to save
         * @param name File name to create
         * @param opts Options
         * @param popup Popup
         */
        fileSave: (blob: string | Blob, name?: string, opts?: any, popup?: any) => void;
    }
    interface ExtButtons {
        [name: string]: ButtonConfig | ButtonFunction;
    }
    interface Context {
        _buttons: ContextButtons[];
    }
    interface ApiSelector {
        /** Options modifier used in this instance (if any) */
        buttonGroup?: GroupSelector;
    }
    interface ConfigButtonsLanguage {
        [key: string]: string | ConfigButtonsLanguage;
    }
    interface ApiButton<T> {
        (groupSelector?: GroupSelector, buttonSelector?: ButtonSelector): ApiButtonMethods<T>;
    }
    interface ApiButtonMethods<T> extends Api<T> {
        /**
         * Get the action function for the selected button.
         *
         * @returns The action function for the selected button.
         */
        action(): ButtonAction;
        /**
         * Set the action function for the selected button.
         *
         * @param set the function that is to be triggered on an action.
         * @returns DataTables Api for chaining
         */
        action(set: ButtonAction): Api<any>;
        /**
         * Get the active state for the selected button.
         *
         * @returns true if currently active, otherwise false.
         */
        active(): boolean;
        /**
         * Set the active state for the selected button.
         *
         * @returns DataTables API instance with the selected button in the
         * result set, available for chaining further operations on the button.
         */
        active(state: boolean): Api<any>;
        /**
         * Create a new button, adding it to the selected button instance and
         * inserting immediately into the document.
         *
         * @returns New DataTables API instance with the result set containing
         * the newly created button. This means it is possible to immediately
         * using the chaining API to manipulate the button.
         */
        add(index: number | string, config: string | Buttons): Api<any>;
        /**
         * Disable the selected buttons.
         *
         * @returns DataTables API instance with the selected button in the
         * result set, available for chaining further operations on the button.
         */
        disable(): Api<any>;
        /**
         * Set the enabled state for the selected button.
         *
         * @returns DataTables API instance with the selected button in the
         * result set, available for chaining further operations on the button.
         */
        enable(state?: boolean): Api<any>;
        /**
         * Get a Dom object that contains a reference to the node for the
         * selected button.
         *
         * @returns A Dom object that contains the node of the selected button
         */
        node(): Dom;
        /**
         * Determine if a button is currently in the processing state or not.
         *
         * @returns true if the button is currently in its processing state,
         * false otherwise.
         */
        processing(): boolean;
        /**
         * Set the processing state for the selected button.
         *
         * @returns DataTables API instance with the selected button in the
         * result set, available for chaining further operations on the buttons.
         */
        processing(set: boolean): Api<any>;
        /**
         * Remove the selected button from the display. The button is destroyed
         * and can no longer be used once removed.
         *
         * @returns DataTables API instance.
         */
        remove(): Api<any>;
        /**
         * Get the display text for the selected button
         *
         * @returns The current display string from the button.
         */
        text(): string;
        /**
         * Set the display text for the selected button
         *
         * @returns DataTables API instance with the selected button in the
         * result set, available for chaining further operations on the buttons.
         */
        text(title: string | FunctionButtonText): Api<any>;
        /**
         * Programmatically trigger the action of the selected button.
         *
         * @returns DataTables API instance with the selected button in the
         * result set, available for chaining further operations on the button.
         */
        trigger(): Api<any>;
        /**
         * Internal reference
         *
         * @ignore
         */
        _groupSelector: GroupSelector;
    }
    interface ApiButtons<T> {
        (groupSelector?: any, buttonSelector?: any): ApiButtonsMethods<T>;
        /**
         * Display / hide an information message to the end user to indicate
         * that something has happened.
         *
         * @returns DataTables API instance for chaining.
         */
        info(title: string | false, message?: string | HTMLElement, time?: number): Api<any>;
        /**
         * Get meta information that is common to many different button types.
         *
         * @returns An object with properties which contain the filename,
         * messageTop, messageBottom and title.
         */
        exportInfo(options?: ButtonsApiExportInfoParameter): ButtonsApiExportInfoReturn;
        /**
         * Obtain data from a DataTable that is suitable for exporting by saving
         * into a file or copying to clipboard.
         *
         * @returns An object with 3 properties, one each for the data in the
         * header, body and footer.
         */
        exportData(options?: ButtonsApiExportDataParameter): ButtonsApiExportDataReturn;
    }
    interface ApiButtonsMethods<T> extends Omit<Api<T>, 'trigger'> {
        /**
         * Get the action function for the selected button.
         *
         * @returns DataTables API instance which contains the action functions
         * for the selected buttons
         */
        action(): Api<Array<ButtonAction>>;
        /**
         * Set the action function for the selected button.
         *
         * @param set the function that is to be triggered on an action.
         * @returns DataTables API instance with the selected buttons in the
         * result set, available for chaining further operations on the buttons.
         */
        action(set: ButtonAction): Api<Array<any>>;
        /**
         * Get the active state for the selected button.
         *
         * @returns API instance which contains true if currently active,
         * otherwise false for each selected button in the result set.
         */
        active(): Api<Array<boolean>>;
        /**
         * Set the active state for the selected button.
         *
         * @returns DataTables API instance with the selected buttons in the
         * result set, available for chaining further operations on the buttons.
         */
        active(state: boolean): Api<Array<any>>;
        /**
         * Get a Dom instance that contains a reference to the button container
         * instance.
         */
        container(): Dom;
        /**
         * Get a Dom instance that contains a reference to the button container
         * instances.
         *
         * @returns Dom instance that contains the container elements for the
         * selected button instances.
         */
        containers(): Dom;
        /**
         * Destroy the selected button instances, removing the container and all
         * button elements from the document.
         *
         * @returns DataTables API instance.
         */
        destroy(): Api<any>;
        /**
         * Disable the selected buttons.
         *
         * @returns DataTables API instance with the selected buttons in the
         * result set, available for chaining further operations on the buttons.
         */
        disable(): Api<Array<any>>;
        /**
         * Set the enabled state for the selected button.
         *
         * @returns DataTables API instance with the selected buttons in the
         * result set, available for chaining further operations on the buttons.
         */
        enable(state?: boolean): Api<Array<any>>;
        /**
         * Get a Dom object that contains a reference to the node for the
         * selected button.
         *
         * @returns A Dom object that contains the node of the selected button
         */
        nodes(): Dom;
        /**
         * Set the processing state for the selected button.
         *
         * @returns DataTables API instance with the selected buttons in the
         * result set, available for chaining further operations on the buttons.
         */
        processing(set: boolean): Api<any>;
        /**
         * Remove the selected button from the display. The button is destroyed
         * and can no longer be used once removed.
         *
         * @returns DataTables API instance.
         */
        remove(): Api<any>;
        /**
         * Get the display text for the selected button
         *
         * @returns The current display string from the button.
         */
        text(): string;
        /**
         * Set the display text for the selected button
         *
         * @returns DataTables API instance with the selected button in the
         * result set, available for chaining further operations on the buttons.
         */
        text(title: string | FunctionButtonText): Api<Array<string>>;
        /**
         * Programmatically trigger the action of the selected button.
         *
         * @returns DataTables API instance with the selected button in the
         * result set, available for chaining further operations on the button.
         */
        trigger(): Api<Array<any>>;
    }
    /**
     * List of all the button types - can be extended by external libraries
     */
    interface Buttons {
        /** Selected columns with individual buttons - toggle column visibility */
        columnsToggle: {
            extend: 'columnsToggle';
            columns?: ColumnSelector;
            columnText?: string;
        };
        /** Single button to toggle column visibility */
        columnToggle: {
            extend: 'columnToggle';
            columns?: ColumnSelector;
            columnText?: string;
        };
        /** Selected columns with individual buttons - set column visibility */
        columnsVisibility: {
            extend: 'columnsVisibility';
            columns?: ColumnSelector;
            columnText?: string;
            visibility: boolean;
        };
        /** Single button to set column visibility */
        columnVisibility: {
            extend: 'columnVisibility';
            columns?: ColumnSelector;
            columnText?: string;
            visibility: boolean;
        };
        /** Restore column visibility to what it was when the table loaded */
        colvisRestore: {
            extend: 'colvisRestore';
        };
        /** Set the column visibility for columns (both show and hide) */
        colvisGroup: {
            extend: 'colvisGroup';
            show: ColumnSelector;
            hide: ColumnSelector;
        };
        /** Copy table data to clipboard */
        copy: {
            extend: 'copy';
            exportOptions?: ButtonExportOptions;
            fieldSeparator?: string;
            fieldBoundary?: string;
            header?: boolean;
            footer?: boolean;
            title?: string;
            messageTop?: string;
            messageBottom?: string;
        };
        copyHtml5: Buttons['copy'];
        /** Create a CSV file with the table data */
        csv: {
            extend: 'csv';
            bom?: boolean;
            filename?: string;
            extension?: string;
            exportOptions?: ButtonExportOptions;
            fieldSeparator?: string;
            fieldBoundary?: string;
            escapeChar?: string;
            charset?: string | null;
            header?: boolean;
            footer?: boolean;
        };
        csvHtml5: Buttons['csv'];
        /** Create an Excel XLSX file with the table data */
        excel: {
            extend: 'excel';
            filename?: string;
            extension?: string;
            exportOptions?: ButtonExportOptions;
            header?: boolean;
            footer?: boolean;
            title?: string;
            messageTop?: string;
            messageBottom?: string;
            createEmptyCells?: boolean;
            autoFilter?: boolean;
            sheetName?: string;
            customize?: null | ((win: Window, conf: Buttons['print'], dt: Api<any>) => void);
        };
        excelHtml5: Buttons['excel'];
        /** Construct a view of the table suitable for printing */
        print: {
            extend: 'print';
            title?: string;
            messageTop?: string;
            messageBottom?: string;
            exportOptions?: ButtonExportOptions;
            header?: boolean;
            footer?: boolean;
            autoPrint?: boolean;
            customScripts?: string[] | null;
            customize?: null | ((xlsx: any, conf: Buttons['print'], dt: Api<any>) => void);
            customizeZip?: null | ((zip: any, data: any, filename: any) => void);
        };
        /** Create a PDF file with the table data */
        pdf: {
            extend: 'pdf';
            title?: string;
            filename?: string;
            extension?: string;
            exportOptions?: ButtonExportOptions;
            orientation?: string;
            pageSize?: string;
            header?: true;
            footer?: true;
            messageTop?: string;
            messageBottom?: string;
            customize?: null | ((doc: any, config: Buttons['pdf'], dt: Api<any>) => void);
            download?: 'download' | 'open';
        };
        pdfHtml5: Buttons['pdf'];
        /** A spacer to visually separate buttons (not a real button!) */
        space: {
            spacer: boolean;
            style: 'empty' | 'bar';
        };
    }
}
interface ButtonsApiExportInfoParameter {
    extension?: ResolvableOption;
    filename?: ResolvableOption;
    messageBottom?: ResolvableOption;
    messageTop?: ResolvableOption;
    title?: ResolvableOption;
    /** @deprecated */
    message?: string | null;
}
interface ButtonsApiExportInfoReturn {
    filename: string;
    messageTop: string;
    messageBottom: string;
    title: string;
}
interface ButtonsApiExportDataParameter {
    rows?: any;
    columns?: any;
    modifier?: any;
    orthogonal?: string;
    stripHtml?: boolean;
    stripNewlines?: boolean;
    decodeEntities?: boolean;
    trim?: boolean;
    format?: any;
}
interface ButtonsApiExportDataReturn {
    header: string[];
    headerStructure: HeaderStructure[][];
    footer: string[];
    footerStructure: HeaderStructure[][];
    body: string[][];
}
interface DefaultsButtonsDom {
    button: ButtonDom;
    buttonContainer?: ElStruct;
    container: ElStruct;
    collection: {
        container: {
            className: string;
            content: ElStruct;
            tag: string;
        };
        button?: {
            active?: string;
            className?: string;
            tag: string;
        };
        split?: SplitStruct;
    };
    split: SplitStruct;
}
interface SplitStruct {
    action: ElStruct;
    button?: ElStruct;
    dropdown: {
        align: string;
        className: string;
        splitAlignClass: string;
        tag: string;
        text?: string;
    };
    wrapper: ElStruct;
}
interface ElStruct {
    className: string;
    tag: string;
}
interface ButtonDom extends ElStruct {
    active: string;
    disabled: string;
    dropClass: string;
    dropHtml: string;
    liner: ElStruct;
    spacer: ElStruct;
}
interface ButtonConfig {
    [prop: string]: any;
    /**
     * Action to take when the button is activated
     */
    action?: ButtonAction;
    /**
     * Button HTML attributes
     */
    attr?: Record<string, string | number>;
    /**
     * Ensure that any requirements have been satisfied before initialising a
     * button
     */
    available?: FunctionButtonAvailable;
    /**
     * Indicate that the processing of the button is async and should be run
     * after the amount of time given here.
     */
    async?: number;
    /**
     * Buttons for a collection.
     */
    buttons?: ButtonsList;
    /**
     * Set the class name for the button
     */
    className?: string;
    /**
     * Control the auto blurring of a button when it is clicked on. If not
     * defined then it will blur automatically (i.e. same as if it were `true`).
     */
    clickBlurs?: boolean;
    /**
     * Function that is called when the button is destroyed
     */
    destroy?: FunctionButtonInit;
    /**
     * Flag to indicate that the button is being destroyed
     *
     * @ignore
     */
    destroying?: boolean;
    /**
     * Indicate if a drop icon should be shown in the button
     */
    dropIcon?: boolean;
    /**
     * Set a button's initial enabled state
     */
    enabled?: boolean;
    /**
     * Define which button type the button should be based on
     */
    extend?: string;
    /**
     * Content to display in this button's slot. No actions or anything else
     * will be performed. It is suggested you use a `spacer` instead.
     *
     * @deprecated
     */
    html?: string;
    /**
     * Define spacer button style
     */
    style?: string;
    /**
     * Initialisation function that can be used to add events specific to this
     * button
     */
    init?: FunctionButtonInit;
    /**
     * Define an activation key for a button
     */
    key?: string | ButtonKey;
    /**
     * Set a name for each selection
     */
    name?: string;
    /**
     * Unique namespace for every button
     */
    namespace?: string;
    /**
     * Parent configuration object - Internal only
     *
     * @ignore
     */
    parent?: ButtonConfig;
    /**
     * Buttons to go at the end of a collection
     */
    prefixButtons?: ButtonsList;
    /**
     * Buttons to go at the end of a collection
     */
    postfixButtons?: ButtonsList;
    /**
     * Indicate that the button is a spacer - uses a simplified DOM
     */
    spacer?: boolean;
    /**
     * Split buttons
     */
    split?: ButtonsList;
    /**
     * Override for the element type to create. If not specified will use that
     * defined by the `dom` structure in `defaults`.
     */
    tag?: string;
    /**
     * The text to show in the button
     */
    text?: string | FunctionButtonText;
    /**
     * Button 'title' attribute text
     */
    titleAttr?: string;
    /**
     * Internal reference to a host collection
     *
     * @ignore
     */
    _collection?: Dom;
}
interface ButtonSettings {
    buttons: ButtonSettings[];
    collection: Dom | null;
    conf: ButtonConfig;
    disabled: boolean;
    inserter: Dom;
    inSplit: boolean;
    inCollection: boolean;
    isCollection: boolean;
    isSplit: boolean;
    node: Dom;
    nodeChild: HTMLElement | null;
    textNode: Dom | null;
}
interface ButtonsKeyboardEvent extends KeyboardEvent {
    _buttonsHandled?: boolean;
}
interface ButtonKey {
    key?: string;
    shiftKey?: boolean;
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
}
/**
 * A function that will be executed upon creation of the buttons.
 */
type FunctionButton = (dt: Api, conf: ButtonConfig) => ButtonConfig;
type FunctionButtonText = (dt: Api, node: Dom, config: any) => string;
type FunctionButtonAvailable = (dt: Api, config: any) => boolean;
type FunctionButtonInit = (this: any, dt: Api, node: Dom, config: any) => void;
type ButtonAction = (this: any, // ApiButtonMethods<T>, TODO
e: MouseEvent, dt: Api, node: Dom, config: ButtonConfig, callback: () => void) => void;
interface CollectionOptions {
    action?: ButtonAction;
    align?: 'button-left' | 'button-right' | 'container' | 'dt-container';
    autoClose?: boolean;
    background?: boolean;
    backgroundClassName?: string;
    buttons: ButtonsList;
    className?: string;
    collectionLayout?: string;
    collectionTitle?: string;
    dropup?: boolean;
    fade?: number;
    popoverTitle?: string;
    postfixButtons?: ButtonsList;
    prefixButtons?: ButtonsList;
    span?: null | 'container' | 'dt-container';
}
interface ButtonFunction {
    (dt: Api, conf: ButtonConfig): string | ButtonConfig | undefined;
}
interface ButtonObject extends ButtonConfig {
}
interface CollectionButtons {
    /** Collection button */
    collection: {
        extend?: 'collection';
    };
    /** A collection of column visibility buttons */
    colvis: {
        extend?: 'colvis';
        columns?: ColumnSelector;
        columnText?: string;
    };
    /** Set the table's paging length */
    pageLength: {
        extend?: 'pageLength';
    };
    /** Split buttons */
    split: {};
}
type ButtonTypes = ButtonConfig | keyof Buttons | (Buttons[keyof Buttons] | ButtonConfig) | keyof CollectionButtons | (CollectionButtons[keyof CollectionButtons] | CollectionOptions) | FunctionButton;
type ButtonsList = Array<ButtonTypes>;
type ButtonSelectorTypes = string | number | JQuery | Dom;
interface ButtonExportOptions {
    rows?: any;
    columns?: ColumnSelector;
    customizeData?: FunctionButtonCustomizeData;
    modifier?: any;
    orthogonal?: string;
    stripHtml?: boolean;
    stripNewlines?: boolean;
    decodeEntities?: boolean;
    trim?: boolean;
    format?: {
        header?: ButtonHeaderFormatter;
        footer?: ButtonHeaderFormatter;
        body?: ButtonBodyFormatter;
    };
}
type ButtonHeaderFormatter = (str: string, idx: number, el: HTMLElement) => string;
type ButtonBodyFormatter = (str: string, row: number, column: number, el: HTMLElement) => string;
type FunctionButtonCustomizeData = (content: any) => void;
interface DefaultsButtons {
    name: string;
    tabIndex: number;
    buttons: ButtonsList;
    dom: DefaultsButtonsDom;
    /**
     * Used for styling integration callback for DOM manipulation
     *
     * @param config
     * @param inserter
     * @param inCollection
     * @returns
     * @internal
     */
    buttonCreated?: (config: ButtonConfig, inserter: Dom, inCollection: boolean) => Dom;
}
interface ConfigButtons extends Partial<DefaultsButtons> {
}
interface SettingsButtons {
    dt: Api;
    buttons: ButtonSettings[];
    listenKeys: string;
    namespace: string;
}
interface DomButtons {
    container: Dom;
}
type EntityDecoder = (str: string) => string;
interface PopoverOptions {
    align: 'button-left' | 'button-right' | 'dt-container' | 'split-left' | 'split-right' | 'container';
    autoClose: boolean;
    background: boolean;
    backgroundClassName: string;
    backgroundHost: HTMLElement;
    closeButton: boolean;
    containerClassName: string;
    contentClassName: string;
    collectionLayout: string;
    collectionTitle: string;
    dropup: boolean;
    fade: number;
    popoverTitle: string;
    rightAlignClassName: string;
    sort: boolean;
    span: string;
    splitAlignClass: string;
    tag: string;
}
interface StripOptions {
    decodeEntities?: boolean;
    escapeExcelFormula?: boolean;
    trim?: boolean;
    stripHtml?: boolean;
    stripNewlines?: boolean;
}
type GroupSelector = number | string | Array<number | string> | Dom | Node | null;
type ButtonSelector = null | number | string | Node | Dom | JQuery | Array<null | number | string | Node | Dom | JQuery>;
interface ContextButtons {
    inst: Buttons;
    name: string;
}
interface SelectedButtons {
    inst: Buttons;
    node: Dom;
}
interface SelectListButtons {
    node: Dom;
    name?: string;
    idx: string;
}
type ResolvableOption = null | undefined | string | ((config: ButtonConfig, dt: Api) => string);

export type { ButtonAction, ButtonBodyFormatter, ButtonConfig, ButtonDom, ButtonExportOptions, ButtonFunction, ButtonHeaderFormatter, ButtonObject, ButtonSelector, ButtonSelectorTypes, ButtonSettings, ButtonTypes, ButtonsApiExportDataReturn, ButtonsApiExportInfoParameter, ButtonsKeyboardEvent, ButtonsList, CollectionButtons, ConfigButtons, ContextButtons, DefaultsButtons, DomButtons, ElStruct, EntityDecoder, FunctionButton, FunctionButtonCustomizeData, FunctionButtonText, GroupSelector, PopoverOptions, ResolvableOption, SelectListButtons, SelectedButtons, SettingsButtons, SplitStruct, StripOptions };
