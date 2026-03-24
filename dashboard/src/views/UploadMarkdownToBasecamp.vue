<template>
  <div class="upload-markdown">
    <h2>Upload Markdown to Basecamp</h2>
    <form @submit.prevent="handleSubmit">
      <input type="file" accept=".md" @change="onFileChange" required />
      <input v-model="bucketId" placeholder="Basecamp Bucket ID" required />
      <button type="submit">Upload</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">Document created successfully!</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { uploadMarkdownToBasecamp } from "../services/basecamp/basecamp";

const file = ref(null);
const bucketId = ref("");
const error = ref("");
const success = ref(false);

function onFileChange(e) {
  file.value = e.target.files[0];
}

async function handleSubmit() {
  error.value = "";
  success.value = false;
  if (!file.value || !bucketId.value) {
    error.value = "Please select a file and enter a bucket ID.";
    return;
  }

  try {
    await uploadMarkdownToBasecamp(file.value, bucketId.value);
    success.value = true;
  } catch (e) {
    error.value = e.response?.data?.error || "Upload failed";
  }
}
</script>
