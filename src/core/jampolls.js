/**
 * Jampolls SDK v1.0.0
 * Easy poll embedding for any website
 * https://jampolls.com
 */
(function(window, document) {
    'use strict';

    // SDK Configuration
    const CONFIG = {
        API_BASE: 'https:/staging-hub.jampolls.com/api',
        CDN_BASE: 'https://cdn.jampolls.com',
        VERSION: '1.0.0',
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    };

    // Fun loading messages
    const LOADING_MESSAGES = [
        "🎯 Loading your awesome poll...",
        "📊 Preparing the voting magic...",
        "🚀 Almost there, poll incoming...",
        "⚡ Charging up the poll power...",
        "🎪 Setting up the voting circus...",
        "🎨 Painting your poll masterpiece...",
        "🔥 Your poll is getting hot...",
        "✨ Sprinkling poll fairy dust...",
        "🎵 Your poll is finding its rhythm...",
        "🌟 Making your poll shine..."
    ];

    // Error messages
    const ERROR_MESSAGES = [
        "🤔 Hmm, the poll seems to be taking a coffee break...",
        "🎭 The poll is being a bit dramatic right now...",
        "🎪 The voting circus is setting up, please wait...",
        "🔧 Our poll engineers are fine-tuning things...",
        "🌈 The poll is choosing the perfect colors...",
        "🎨 Adding the finishing touches to your poll..."
    ];

    // Device fingerprinting for unique voter ID
    function generateVoterFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Jampolls Fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL(),
            navigator.platform,
            navigator.cookieEnabled,
            localStorage ? 'ls' : 'nls'
        ].join('|');

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(36);
    }

    // API Communication
    class JamPollsAPI {
        constructor(embedKey) {
            this.embedKey = embedKey;
            this.voterID = this.getOrCreateVoterID();
        }

        getOrCreateVoterID() {
            const storageKey = `jampolls_voter_${this.embedKey}`;
            let voterID = localStorage.getItem(storageKey);
            
            if (!voterID) {
                voterID = `jp_${generateVoterFingerprint()}_${Date.now()}`;
                localStorage.setItem(storageKey, voterID);
            }
            
            return voterID;
        }

        async fetchPollData() {
            const url = `${CONFIG.API_BASE}/widgets/${this.embedKey}/`;
            
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-SDK-Version': CONFIG.VERSION
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Jampolls: Failed to fetch poll data:', error);
                throw error;
            }
        }

        async submitVote(optionId, removeVote = false) {
            const url = `${CONFIG.API_BASE}/widgets/${this.embedKey}/vote/`;
            
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-SDK-Version': CONFIG.VERSION
                    },
                    body: JSON.stringify({
                        option_id: optionId,
                        voter_id: this.voterID,
                        remove_vote: removeVote
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Jampolls: Failed to submit vote:', error);
                throw error;
            }
        }
    }

    // Widget Renderer
    class JamPollsWidget {
        constructor(embedKey, containerId, options = {}) {
            this.embedKey = embedKey;
            this.container = document.getElementById(containerId);
            this.options = {
                theme: 'auto',
                showResults: true,
                autoHeight: true,
                showBranding: true,
                onLoad: null,
                onVote: null,
                onError: null,
                ...options
            };

            this.api = new JamPollsAPI(embedKey);
            this.pollData = null;
            this.currentVotes = new Set();
            
            if (!this.container) {
                console.error(`Jampolls: Container element '${containerId}' not found`);
                return;
            }

            this.init();
        }

        async init() {
            this.showLoading();
            
            try {
                await this.loadPollData();
                this.render();
                
                if (this.options.onLoad) {
                    this.options.onLoad(this.pollData);
                }
            } catch (error) {
                this.showError();
                
                if (this.options.onError) {
                    this.options.onError(error);
                }
            }
        }

        async loadPollData() {
            let attempts = 0;
            
            while (attempts < CONFIG.RETRY_ATTEMPTS) {
                try {
                    this.pollData = await this.api.fetchPollData();
                    return;
                } catch (error) {
                    attempts++;
                    
                    if (attempts < CONFIG.RETRY_ATTEMPTS) {
                        await this.delay(CONFIG.RETRY_DELAY * attempts);
                        this.updateLoadingMessage();
                    } else {
                        throw error;
                    }
                }
            }
        }

        showLoading() {
            const message = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
            
            this.container.innerHTML = `
                <div class="jampolls-loading">
                    <div class="jampolls-spinner"></div>
                    <p class="jampolls-loading-text">${message}</p>
                </div>
            `;
        }

        updateLoadingMessage() {
            const loadingText = this.container.querySelector('.jampolls-loading-text');
            if (loadingText) {
                const message = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
                loadingText.textContent = message;
            }
        }

        showError() {
            const message = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
            
            this.container.innerHTML = `
                <div class="jampolls-error">
                    <div class="jampolls-error-icon">🎪</div>
                    <p class="jampolls-error-text">${message}</p>
                    <button class="jampolls-retry-btn" onclick="this.closest('.jampolls-widget').jampolls.retry()">
                        Try Again
                    </button>
                </div>
            `;
        }

        render() {
            if (!this.pollData || !this.pollData.poll_data) {
                this.showError();
                return;
            }

            const poll = this.pollData.poll_data;
            const theme = this.getTheme();
            
            const widgetHTML = `
                <div class="jampolls-widget" data-theme="${theme}">
                    ${this.renderHeader(poll)}
                    ${this.renderOptions(poll)}
                    ${this.renderFooter()}
                </div>
            `;

            this.container.innerHTML = widgetHTML;
            this.attachEventListeners();
            
            // Store widget reference for retry functionality
            this.container.querySelector('.jampolls-widget').jampolls = this;
        }

        renderHeader(poll) {
            return `
                <div class="jampolls-header">
                    ${poll.image ? `<img src="${poll.image}" alt="Poll image" class="jampolls-poll-image">` : ''}
                    <h3 class="jampolls-question">${this.escapeHtml(poll.question)}</h3>
                    <div class="jampolls-meta">
                        <span class="jampolls-votes-count">${poll.votes_count} votes</span>
                        ${!poll.is_active ? '<span class="jampolls-status-closed">Poll Closed</span>' : ''}
                    </div>
                </div>
            `;
        }

        renderOptions(poll) {
            return `
                <div class="jampolls-options">
                    ${poll.options.map(option => this.renderOption(option, poll)).join('')}
                </div>
            `;
        }

        renderOption(option, poll) {
            const percentage = poll.votes_count > 0 ? (option.votes_count / poll.votes_count * 100).toFixed(1) : 0;
            const isVoted = this.currentVotes.has(option.id);
            const showResults = this.options.showResults && poll.votes_count > 0;

            return `
                <div class="jampolls-option ${isVoted ? 'voted' : ''}" data-option-id="${option.id}">
                    <div class="jampolls-option-content">
                        ${option.image ? `<img src="${option.image}" alt="" class="jampolls-option-image">` : ''}
                        <span class="jampolls-option-text">${this.escapeHtml(option.text)}</span>
                        ${showResults ? `<span class="jampolls-option-percentage">${percentage}%</span>` : ''}
                        ${showResults ? `<span class="jampolls-option-votes">${option.votes_count} votes</span>` : ''}
                    </div>
                    ${showResults ? `<div class="jampolls-option-bar" style="width: ${percentage}%"></div>` : ''}
                    ${poll.is_active ? `<button class="jampolls-vote-btn" ${isVoted ? 'data-remove="true"' : ''}>
                        ${isVoted ? '✓ Voted' : 'Vote'}
                    </button>` : ''}
                </div>
            `;
        }

        renderFooter() {
            return `
                <div class="jampolls-footer">
                    ${this.options.showBranding ? `
                        <a href="https://jampolls.com" target="_blank" class="jampolls-branding">
                            <span class="jampolls-logo">🎯</span>
                            Powered by Jampolls
                        </a>
                    ` : ''}
                </div>
            `;
        }

        attachEventListeners() {
            const voteButtons = this.container.querySelectorAll('.jampolls-vote-btn');
            
            voteButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const option = button.closest('.jampolls-option');
                    const optionId = parseInt(option.dataset.optionId);
                    const removeVote = button.hasAttribute('data-remove');
                    
                    this.handleVote(optionId, removeVote);
                });
            });
        }

        async handleVote(optionId, removeVote = false) {
            try {
                // Disable all vote buttons during submission
                this.setVotingState(true);
                
                const result = await this.api.submitVote(optionId, removeVote);
                
                if (result.success) {
                    // Update local vote state
                    if (removeVote) {
                        this.currentVotes.delete(optionId);
                    } else {
                        this.currentVotes.add(optionId);
                    }

                    // Update poll data if results are included
                    if (result.results) {
                        this.pollData.poll_data = result.results;
                    }

                    // Re-render the widget
                    this.render();

                    if (this.options.onVote) {
                        this.options.onVote(result);
                    }
                } else {
                    throw new Error(result.message || 'Vote submission failed');
                }
            } catch (error) {
                console.error('Jampolls: Vote submission failed:', error);
                this.setVotingState(false);
                this.showVoteError(error.message);
            }
        }

        setVotingState(isVoting) {
            const buttons = this.container.querySelectorAll('.jampolls-vote-btn');
            buttons.forEach(button => {
                button.disabled = isVoting;
                if (isVoting) {
                    button.textContent = 'Voting...';
                }
            });
        }

        showVoteError(message) {
            // Create temporary error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'jampolls-vote-error';
            errorDiv.textContent = message || 'Vote submission failed. Please try again.';
            
            this.container.querySelector('.jampolls-options').appendChild(errorDiv);
            
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 3000);
        }

        getTheme() {
            if (this.options.theme !== 'auto') {
                return this.options.theme;
            }

            // Auto-detect theme based on background color
            const bgColor = window.getComputedStyle(this.container).backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                const rgb = bgColor.match(/\d+/g);
                if (rgb) {
                    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
                    return brightness > 128 ? 'light' : 'dark';
                }
            }

            // Check for dark mode media query
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }

            return 'light';
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        retry() {
            this.init();
        }

        // Public methods
        refresh() {
            this.init();
        }

        switchPoll(newEmbedKey) {
            this.embedKey = newEmbedKey;
            this.api = new JamPollsAPI(newEmbedKey);
            this.currentVotes.clear();
            this.init();
        }
    }

    // Main SDK object
    const JamPolls = {
        version: CONFIG.VERSION,
        widgets: new Map(),

        embed(embedKey, containerId, options = {}) {
            if (!embedKey) {
                console.error('Jampolls: Embed key is required');
                return null;
            }

            if (!containerId) {
                console.error('Jampolls: Container ID is required');
                return null;
            }

            // Create widget instance
            const widget = new JamPollsWidget(embedKey, containerId, options);
            this.widgets.set(containerId, widget);

            return widget;
        },

        getWidget(containerId) {
            return this.widgets.get(containerId);
        },

        removeWidget(containerId) {
            const widget = this.widgets.get(containerId);
            if (widget) {
                widget.container.innerHTML = '';
                this.widgets.delete(containerId);
            }
        },

        // Utility method to auto-embed widgets with data attributes
        autoEmbed() {
            const widgets = document.querySelectorAll('[data-jampolls-embed]');
            
            widgets.forEach((element, index) => {
                const embedKey = element.getAttribute('data-jampolls-embed');
                const containerId = element.id || `jampolls-auto-${index}`;
                
                if (!element.id) {
                    element.id = containerId;
                }

                const options = {
                    theme: element.getAttribute('data-theme') || 'auto',
                    showResults: element.getAttribute('data-show-results') !== 'false',
                    autoHeight: element.getAttribute('data-auto-height') !== 'false',
                    showBranding: element.getAttribute('data-show-branding') !== 'false'
                };

                this.embed(embedKey, containerId, options);
            });
        }
    };

    // Auto-embed when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => JamPolls.autoEmbed());
    } else {
        JamPolls.autoEmbed();
    }

    // Global object
    window.JamPolls = JamPolls;

})(window, document);