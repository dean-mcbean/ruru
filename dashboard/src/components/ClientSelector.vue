<script>
import { ref } from "vue";
import { watchEffect } from "vue";

export default {
  name: "ClientSelector",
  props: {
    clients: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["client-selected"],
  setup(props, { emit }) {
    const selectedClient = ref(null);

    const selectClient = (client) => {
      selectedClient.value = client;
    };

    const confirmSelection = () => {
      if (selectedClient.value) {
        emit("client-selected", selectedClient.value);
      }
    };

    // Auto-select if only one client
    watchEffect(() => {
      if (props.clients.length === 1) {
        selectedClient.value = props.clients[0];
      } else if (props.clients.length !== 1) {
        selectedClient.value = null;
      }
    });

    return {
      selectedClient,
      selectClient,
      confirmSelection,
    };
  },
};
</script>

<style scoped>
.client-selector {
  padding: 1rem 0;
}

.client-selector h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.description {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.client-list {
  margin-bottom: 2rem;
}

.client-card {
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.client-card:hover {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.client-card.selected {
  border-color: #3498db;
  background-color: #ebf3fd;
}

.client-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.client-name {
  color: #7f8c8d;
  font-size: 0.875rem;
  margin: 0;
}

.terms-warning {
  color: #e74c3c;
  font-size: 0.75rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.client-actions input[type="radio"] {
  transform: scale(1.2);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
}

.confirm-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 120px;
}

.confirm-button:hover:not(:disabled) {
  background: #2980b9;
}

.confirm-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}
</style>
