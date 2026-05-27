// ==UserScript==
// @name         AI Problem Helper
// @namespace    http://tampermonkey.net/
// @version      0.2.0
// @description  Extracts visible math or word problems, asks your local OpenAI-compatible model for help, and can fill the focused answer box on demand.
// @author       You
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      127.0.0.1
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        apiBase: 'http://127.0.0.1:8081/v1',
        maxContextChars: 2400,
        hotkeys: {
            solve: 'Alt+Shift+A',
            fill: 'Alt+Shift+F',
            toggle: 'Alt+Shift+H'
        }
    };

    const PANEL_ID = '__ai_problem_helper';
    const state = {
        modelName: '',
        lastProblemText: '',
        lastAnswer: '',
        lastShortAnswer: '',
        lastTarget: null,
        lastPointerTarget: null,
        open: false,
        busy: false,
        ui: null
    };

    injectStyles();
    buildUi();
    bindPageTracking();
    setStatus('Ready. Select text or click near a problem, then press Alt+Shift+A.');

    function injectStyles() {
        const css = `
            #${PANEL_ID} {
                position: fixed;
                right: 16px;
                bottom: 16px;
                z-index: 2147483647;
                font: 13px/1.4 'Segoe UI', Arial, sans-serif;
                color: #ecf7ff;
            }

            #${PANEL_ID},
            #${PANEL_ID} * {
                box-sizing: border-box;
            }

            #${PANEL_ID} .aph-launcher,
            #${PANEL_ID} .aph-button {
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 999px;
                cursor: pointer;
                background: rgba(8, 18, 30, 0.96);
                color: #ecf7ff;
                transition: transform 120ms ease, background-color 120ms ease;
            }

            #${PANEL_ID} .aph-launcher:hover,
            #${PANEL_ID} .aph-button:hover {
                transform: translateY(-1px);
                background: rgba(17, 34, 55, 0.98);
            }

            #${PANEL_ID} .aph-launcher {
                padding: 12px 16px;
                font-weight: 700;
                letter-spacing: 0.02em;
                box-shadow: 0 14px 40px rgba(0, 0, 0, 0.3);
            }

            #${PANEL_ID} .aph-panel {
                width: 380px;
                margin-top: 10px;
                display: none;
                background: rgba(8, 16, 26, 0.98);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 18px;
                box-shadow: 0 18px 48px rgba(0, 0, 0, 0.34);
                overflow: hidden;
            }

            #${PANEL_ID}.is-open .aph-panel {
                display: block;
            }

            #${PANEL_ID} .aph-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 14px 14px 10px;
                background: linear-gradient(135deg, rgba(255, 132, 92, 0.22), rgba(87, 199, 255, 0.12));
            }

            #${PANEL_ID} .aph-title {
                font-size: 15px;
                font-weight: 700;
            }

            #${PANEL_ID} .aph-subtitle {
                margin-top: 2px;
                font-size: 11px;
                color: rgba(236, 247, 255, 0.68);
            }

            #${PANEL_ID} .aph-close {
                width: 34px;
                height: 34px;
                border-radius: 999px;
                border: 1px solid rgba(255, 255, 255, 0.14);
                background: rgba(255, 255, 255, 0.08);
                color: #ecf7ff;
                cursor: pointer;
            }

            #${PANEL_ID} .aph-body {
                padding: 12px 14px 14px;
            }

            #${PANEL_ID} .aph-status {
                margin-bottom: 10px;
                padding: 9px 11px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.06);
                color: rgba(236, 247, 255, 0.78);
            }

            #${PANEL_ID} .aph-status.is-error {
                background: rgba(255, 101, 101, 0.14);
                color: #ffc7c7;
            }

            #${PANEL_ID} .aph-status.is-success {
                background: rgba(88, 218, 164, 0.14);
                color: #baf7db;
            }

            #${PANEL_ID} .aph-controls {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 8px;
                margin-bottom: 10px;
            }

            #${PANEL_ID} .aph-button {
                padding: 10px 12px;
                font-size: 12px;
                font-weight: 700;
            }

            #${PANEL_ID} .aph-button.primary {
                background: linear-gradient(135deg, #ff845c, #ffb36b);
                color: #1f0e03;
            }

            #${PANEL_ID} .aph-button.primary:hover {
                background: linear-gradient(135deg, #ff946d, #ffc17e);
            }

            #${PANEL_ID} .aph-button:disabled {
                opacity: 0.45;
                cursor: wait;
                transform: none;
            }

            #${PANEL_ID} .aph-label {
                display: block;
                margin: 10px 0 6px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: rgba(236, 247, 255, 0.58);
            }

            #${PANEL_ID} .aph-context,
            #${PANEL_ID} .aph-answer,
            #${PANEL_ID} .aph-explanation {
                width: 100%;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.04);
                color: #ecf7ff;
            }

            #${PANEL_ID} .aph-context {
                min-height: 108px;
                resize: vertical;
                padding: 10px 12px;
            }

            #${PANEL_ID} .aph-answer {
                min-height: 48px;
                padding: 11px 12px;
                font-size: 16px;
                font-weight: 700;
                white-space: pre-wrap;
                word-break: break-word;
            }

            #${PANEL_ID} .aph-explanation {
                min-height: 92px;
                padding: 11px 12px;
                white-space: pre-wrap;
                word-break: break-word;
            }

            #${PANEL_ID} .aph-footer {
                margin-top: 10px;
                font-size: 11px;
                color: rgba(236, 247, 255, 0.58);
            }
        `;

        if (typeof GM_addStyle === 'function') {
            GM_addStyle(css);
            return;
        }

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function buildUi() {
        const existing = document.getElementById(PANEL_ID);
        if (existing) {
            existing.remove();
        }

        const root = document.createElement('div');
        root.id = PANEL_ID;
        root.innerHTML = `
            <button type="button" class="aph-launcher">AI Helper</button>
            <section class="aph-panel">
                <div class="aph-header">
                    <div>
                        <div class="aph-title">AI Problem Helper</div>
                        <div class="aph-subtitle">Reads selected or nearby problem text and asks your local model.</div>
                    </div>
                    <button type="button" class="aph-close" title="Close">x</button>
                </div>
                <div class="aph-body">
                    <div class="aph-status"></div>
                    <div class="aph-controls">
                        <button type="button" class="aph-button primary" data-action="solve">Solve</button>
                        <button type="button" class="aph-button" data-action="explain">Explain</button>
                        <button type="button" class="aph-button" data-action="capture">Refresh Context</button>
                        <button type="button" class="aph-button" data-action="fill">Fill Focused Box</button>
                    </div>
                    <label class="aph-label" for="aph-context-box">Extracted problem text</label>
                    <textarea id="aph-context-box" class="aph-context" spellcheck="false"></textarea>
                    <label class="aph-label">Suggested answer</label>
                    <div class="aph-answer"></div>
                    <label class="aph-label">Reasoning</label>
                    <div class="aph-explanation"></div>
                    <div class="aph-footer">Hotkeys: ${CONFIG.hotkeys.solve} solve, ${CONFIG.hotkeys.fill} fill answer, ${CONFIG.hotkeys.toggle} toggle helper.</div>
                </div>
            </section>`;

        document.body.appendChild(root);

        state.ui = {
            root,
            launcher: root.querySelector('.aph-launcher'),
            panel: root.querySelector('.aph-panel'),
            close: root.querySelector('.aph-close'),
            status: root.querySelector('.aph-status'),
            context: root.querySelector('.aph-context'),
            answer: root.querySelector('.aph-answer'),
            explanation: root.querySelector('.aph-explanation'),
            solve: root.querySelector('[data-action="solve"]'),
            explain: root.querySelector('[data-action="explain"]'),
            capture: root.querySelector('[data-action="capture"]'),
            fill: root.querySelector('[data-action="fill"]')
        };

        state.ui.launcher.addEventListener('click', () => togglePanel());
        state.ui.close.addEventListener('click', () => togglePanel(false));
        state.ui.solve.addEventListener('click', () => runAssistant('solve'));
        state.ui.explain.addEventListener('click', () => runAssistant('explain'));
        state.ui.capture.addEventListener('click', () => captureContext(true));
        state.ui.fill.addEventListener('click', () => fillLastAnswer());
    }

    function bindPageTracking() {
        document.addEventListener('pointerdown', event => {
            if (event.target && !isInsidePanel(event.target)) {
                state.lastPointerTarget = event.target;
            }
        }, true);

        document.addEventListener('keydown', event => {
            if (!(event.altKey && event.shiftKey)) {
                return;
            }

            const key = String(event.key || '').toLowerCase();
            if (key === 'a') {
                event.preventDefault();
                runAssistant('solve');
            } else if (key === 'f') {
                event.preventDefault();
                fillLastAnswer();
            } else if (key === 'h') {
                event.preventDefault();
                togglePanel();
            }
        }, true);
    }

    function isInsidePanel(node) {
        return Boolean(node && node.closest && node.closest(`#${PANEL_ID}`));
    }

    function togglePanel(forceOpen) {
        state.open = typeof forceOpen === 'boolean' ? forceOpen : !state.open;
        state.ui.root.classList.toggle('is-open', state.open);
        if (state.open) {
            captureContext(false);
        }
    }

    function setStatus(message, tone) {
        state.ui.status.textContent = message;
        state.ui.status.classList.remove('is-error', 'is-success');
        if (tone === 'error') {
            state.ui.status.classList.add('is-error');
        } else if (tone === 'success') {
            state.ui.status.classList.add('is-success');
        }
    }

    function setBusy(busy) {
        state.busy = busy;
        [state.ui.solve, state.ui.explain, state.ui.capture, state.ui.fill].forEach(button => {
            button.disabled = busy;
        });
    }

    function normalizeText(value) {
        return String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\r/g, '')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function isEditableElement(element) {
        if (!element || isInsidePanel(element)) {
            return false;
        }

        if (element.isContentEditable) {
            return true;
        }

        if (!(element instanceof HTMLElement)) {
            return false;
        }

        if (element.tagName === 'TEXTAREA') {
            return true;
        }

        if (element.tagName !== 'INPUT') {
            return false;
        }

        const type = String(element.type || '').toLowerCase();
        return !['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit'].includes(type);
    }

    function getFocusedAnswerTarget() {
        return isEditableElement(document.activeElement) ? document.activeElement : null;
    }

    function cloneAndExtractText(element) {
        if (!(element instanceof HTMLElement)) {
            return '';
        }

        const clone = element.cloneNode(true);
        clone.querySelectorAll(`#${PANEL_ID}, script, style, noscript, iframe, canvas, svg, video, audio, button, input, textarea, select, option`).forEach(node => node.remove());
        const text = normalizeText(clone.innerText || clone.textContent || '');
        return text.slice(0, CONFIG.maxContextChars * 2);
    }

    function countMatches(text, regex) {
        const matches = String(text || '').match(regex);
        return matches ? matches.length : 0;
    }

    function splitIntoProblemSnippets(text) {
        const normalized = normalizeText(text);
        if (!normalized) {
            return [];
        }

        const snippets = [];
        const seen = new Set();

        const addSnippet = value => {
            const snippet = normalizeText(value).slice(0, CONFIG.maxContextChars);
            if (!snippet || snippet.length < 12) {
                return;
            }

            const key = snippet.toLowerCase();
            if (seen.has(key)) {
                return;
            }

            seen.add(key);
            snippets.push(snippet);
        };

        addSnippet(normalized);

        const paragraphs = normalized.split(/\n+/).map(part => normalizeText(part)).filter(Boolean);
        paragraphs.forEach(addSnippet);
        for (let index = 0; index < paragraphs.length - 1; index += 1) {
            addSnippet(`${paragraphs[index]} ${paragraphs[index + 1]}`);
        }

        const sentences = normalized
            .split(/(?<=[.?!])\s+(?=[A-Z0-9(])/)
            .map(part => normalizeText(part))
            .filter(Boolean);

        sentences.forEach(addSnippet);
        for (let index = 0; index < sentences.length - 1; index += 1) {
            addSnippet(`${sentences[index]} ${sentences[index + 1]}`);
        }

        return snippets.slice(0, 24);
    }

    function scoreProblemCandidate(text, bonus = 0) {
        if (!text) {
            return -100;
        }

        const wordCount = text.split(/\s+/).filter(Boolean).length;
        if (wordCount < 3) {
            return -100;
        }

        const numberHits = countMatches(text, /\d/g);
        const symbolHits = countMatches(text, /[+\-*/=<>×÷^]/g);
        const keywordHits = countMatches(text, /\b(?:solve|find|what|which|how many|how much|equation|expression|simplify|evaluate|calculate|compute|ratio|fraction|decimal|percent|probability|area|perimeter|volume|mean|median|mode|average|sum|difference|product|quotient|distance|speed|time|money|cost|price|discount|tax|change|remaining|left|each|altogether|total|share|equal|less|more|twice|triple|half|quarter|integer|variable|angle|triangle|circle|radius|diameter|square|rectangle|length|width|height|students?|tickets?|apples?|books?|coins?|dollars?|cents?|minutes?|hours?|days?|weeks?|meters?|centimeters?|kilometers?|miles?)\b/gi);
        const unitHits = countMatches(text, /\b(?:cm|mm|m|km|inch(?:es)?|in|ft|feet|yard(?:s)?|yd|mile(?:s)?|mi|kg|g|gram(?:s)?|lb|lbs|pound(?:s)?|oz|ounce(?:s)?|second(?:s)?|minute(?:s)?|hour(?:s)?|day(?:s)?|week(?:s)?|month(?:s)?|year(?:s)?|dollar(?:s)?|cent(?:s)?|percent)\b/gi);
        const questionHits = countMatches(text, /[?]/g);
        const noiseHits = countMatches(text, /\b(?:home|menu|navigation|search|account|profile|settings|privacy|cookie|terms|sign in|sign up|subscribe|share|download|install|contact|support)\b/gi);

        let score = bonus;

        if (wordCount >= 4 && wordCount <= 120) {
            score += 6;
        } else if (wordCount <= 180) {
            score += 2;
        } else {
            score -= 10;
        }

        score += Math.min(12, Math.ceil(numberHits / 2));
        score += Math.min(10, symbolHits * 3);
        score += keywordHits * 4;
        score += Math.min(6, unitHits * 2);
        score += Math.min(6, questionHits * 2);

        if (/\b(?:if|then|after|before|remaining|left|altogether|equals?)\b/i.test(text)) {
            score += 2;
        }

        if (!numberHits && !symbolHits && keywordHits < 2) {
            score -= 20;
        }

        if (noiseHits && keywordHits === 0 && symbolHits === 0) {
            score -= 18;
        }

        if (/copyright|all rights reserved/i.test(text)) {
            score -= 30;
        }

        return score;
    }

    function isVisibleElement(element) {
        if (!(element instanceof HTMLElement) || isInsidePanel(element)) {
            return false;
        }

        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
            return false;
        }

        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.top <= window.innerHeight;
    }

    function extractSelectionText() {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            return '';
        }

        return normalizeText(selection.toString()).slice(0, CONFIG.maxContextChars);
    }

    function collectProblemCandidates(anchor, selectionText) {
        const candidates = new Map();

        const addCandidate = (text, bonus, source) => {
            for (const snippet of splitIntoProblemSnippets(text)) {
                const score = scoreProblemCandidate(snippet, bonus);
                if (score < 4) {
                    continue;
                }

                const key = snippet.toLowerCase();
                const current = candidates.get(key);
                if (!current || score > current.score) {
                    candidates.set(key, { text: snippet, score, source });
                }
            }
        };

        if (selectionText) {
            addCandidate(selectionText, 18, 'selection');
        }

        let current = anchor instanceof Node ? anchor : null;
        if (current && current.nodeType !== Node.ELEMENT_NODE) {
            current = current.parentElement;
        }

        let depth = 0;
        while (current && current instanceof HTMLElement && current !== document.body && depth < 6) {
            addCandidate(cloneAndExtractText(current), 12 - (depth * 2), depth === 0 ? 'nearby element' : 'nearby context');
            current = current.parentElement;
            depth += 1;
        }

        const selectors = 'article, main, section, [role="main"], [role="article"], li, p, label, legend, td, th, div, h1, h2, h3, h4';
        const visibleNodes = Array.from(document.querySelectorAll(selectors)).slice(0, 700);

        for (const node of visibleNodes) {
            if (!isVisibleElement(node)) {
                continue;
            }

            if (node.childElementCount > 40) {
                continue;
            }

            const text = cloneAndExtractText(node);
            if (!text || text.length < 12) {
                continue;
            }

            addCandidate(text, 0, 'page scan');
        }

        return Array.from(candidates.values()).sort((left, right) => right.score - left.score);
    }

    function captureContext(showStatus) {
        const selectionText = extractSelectionText();
        const focusedTarget = getFocusedAnswerTarget();
        const anchor = focusedTarget || state.lastPointerTarget;

        const candidates = collectProblemCandidates(anchor, selectionText);
        const bestCandidate = candidates[0] || null;
        const text = bestCandidate?.text || '';
        const source = bestCandidate?.source || 'page scan';

        state.lastProblemText = text;
        state.lastTarget = focusedTarget || (isEditableElement(anchor) ? anchor : null);
        state.ui.context.value = text;

        if (showStatus) {
            if (text) {
                setStatus(`Captured relevant math from ${source}.`, 'success');
            } else {
                setStatus('Could not find math-like text on the page. Select the problem or click near it first.', 'error');
            }
        }

        return text;
    }

    async function ensureModelName() {
        if (state.modelName) {
            return state.modelName;
        }

        const payload = await requestJson('GET', `${CONFIG.apiBase}/models`);
        state.modelName = payload?.data?.[0]?.id || payload?.models?.[0]?.model || payload?.models?.[0]?.name || '';

        if (!state.modelName) {
            throw new Error('No local model was returned by /v1/models.');
        }

        return state.modelName;
    }

    async function requestJson(method, url, body) {
        if (typeof GM_xmlhttpRequest === 'function') {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method,
                    url,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: body ? JSON.stringify(body) : undefined,
                    onload: response => {
                        if (response.status < 200 || response.status >= 300) {
                            reject(new Error(response.responseText || `Request failed (${response.status})`));
                            return;
                        }

                        try {
                            resolve(JSON.parse(response.responseText));
                        } catch {
                            reject(new Error('The local AI returned invalid JSON.'));
                        }
                    },
                    onerror: () => reject(new Error('Could not reach the local AI service.')),
                    ontimeout: () => reject(new Error('The local AI request timed out.'))
                });
            });
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            throw new Error(await response.text() || `Request failed (${response.status})`);
        }

        return response.json();
    }

    function parseAssistantPayload(content) {
        const cleaned = String(content || '')
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```$/i, '')
            .trim();

        const direct = tryParseJson(cleaned);
        if (direct) {
            return direct;
        }

        const objectMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            const extracted = tryParseJson(objectMatch[0]);
            if (extracted) {
                return extracted;
            }
        }

        return {
            problem: state.lastProblemText,
            answer: cleaned,
            short_answer: cleaned.split('\n')[0].trim(),
            explanation: cleaned,
            missing_information: '',
            confidence: 'unknown'
        };
    }

    function tryParseJson(text) {
        try {
            return JSON.parse(text);
        } catch {
            return null;
        }
    }

    async function askLocalModel(problemText, mode) {
        const model = await ensureModelName();
        const systemPrompt = [
            'You are a browser study assistant for math and word problems shown on a webpage.',
            'Use only the extracted on-screen text you are given.',
            'Return strict JSON only.',
            'Required keys: problem, answer, short_answer, explanation, missing_information, confidence.',
            'short_answer must be the exact short text suitable for an answer box, including units when needed.',
            'If the text is incomplete or ambiguous, explain that in missing_information and still provide your best interpretation.'
        ].join(' ');

        const userPrompt = [
            mode === 'explain'
                ? 'Explain and solve this on-screen problem.'
                : 'Solve this on-screen problem and provide the shortest fill-in answer too.',
            'Return JSON only.',
            '',
            'Problem text:',
            problemText
        ].join('\n');

        const payload = await requestJson('POST', `${CONFIG.apiBase}/chat/completions`, {
            model,
            temperature: 0.2,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        });

        return parseAssistantPayload(payload?.choices?.[0]?.message?.content || '');
    }

    function renderResult(result) {
        const answer = normalizeText(result.short_answer || result.answer || '');
        const explanation = normalizeText(result.explanation || result.missing_information || '');

        state.lastAnswer = normalizeText(result.answer || answer);
        state.lastShortAnswer = answer;

        state.ui.answer.textContent = answer || 'No answer returned.';
        state.ui.explanation.textContent = explanation || 'No explanation returned.';
    }

    async function runAssistant(mode) {
        togglePanel(true);
        const problemText = captureContext(false) || normalizeText(state.ui.context.value);
        if (!problemText) {
            setStatus('Could not find problem text. Select the question text or click near it first.', 'error');
            return;
        }

        setBusy(true);
        setStatus('Asking your local AI model...', undefined);

        try {
            const result = await askLocalModel(problemText, mode);
            renderResult(result);
            setStatus('Answer ready.', 'success');
        } catch (error) {
            setStatus(error.message, 'error');
        } finally {
            setBusy(false);
        }
    }

    function setElementValue(target, value) {
        if (!target) {
            return false;
        }

        if (target.isContentEditable) {
            target.textContent = value;
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }

        const prototype = Object.getPrototypeOf(target);
        const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
        if (descriptor && typeof descriptor.set === 'function') {
            descriptor.set.call(target, value);
        } else {
            target.value = value;
        }

        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }

    async function fillLastAnswer() {
        togglePanel(true);
        if (!state.lastShortAnswer && !state.lastAnswer) {
            await runAssistant('solve');
            if (!state.lastShortAnswer && !state.lastAnswer) {
                return;
            }
        }

        const target = getFocusedAnswerTarget() || state.lastTarget;
        if (!target || !isEditableElement(target)) {
            setStatus('Click the answer box first, then try Fill Focused Box again.', 'error');
            return;
        }

        const value = state.lastShortAnswer || state.lastAnswer;
        if (!setElementValue(target, value)) {
            setStatus('Could not write into the focused field.', 'error');
            return;
        }

        target.focus();
        setStatus('Filled the focused answer box.', 'success');
    }
})();
