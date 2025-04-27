<script>
    /**
     * @prop {string} name - The display name of the service
     * @prop {boolean} running - Whether the service is running
     */
    export let name = 'Service';
    export let running = false;
  </script>
  
  <div class="status-card {running ? 'running' : 'stopped'}">
    <span class="indicator"></span>
    <span class="service-name">{name}</span>
  </div>
  
  <style>
    .status-card {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      background: #f3f4f6;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: background 0.2s ease;
    }
    .status-card.running {
      background: #dcfce7; /* light green */
    }
    .status-card.stopped {
      background: #fee2e2; /* light red */
    }
    .indicator {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      margin-right: 0.5rem;
      background-color: var(--indicator-color);
      animation: var(--indicator-animation);
      transition: background-color 0.2s ease;
    }
    .status-card.running {
      --indicator-color: #16a34a; /* green-600 */
      --indicator-animation: pulse 2s infinite;
    }
    .status-card.stopped {
      --indicator-color: #dc2626; /* red-600 */
      --indicator-animation: none;
    }
    .service-name {
      font-weight: 600;
      font-size: 12px;
      color: #1f2937;
    }
  
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
  </style>
  