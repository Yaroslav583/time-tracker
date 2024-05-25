<template>
  <div>
    <h2>Track Time</h2>
    <input type="date" v-model="newEntry.date" />
    <select v-model="newEntry.category">
      <option v-for="category in categories" :key="category">{{ category }}</option>
    </select>
    <input type="number" v-model="newEntry.hours" placeholder="Hours" />
    <button @click="saveEntry">Save</button>

    <h2>Time Entries</h2>
    <div v-for="(weekEntries, index) in groupedTimeEntries" :key="index">
      <h3>Week {{ index + 1 }}</h3>
      <div v-for="entry in weekEntries" :key="entry.id">
        {{ entry.date }} - {{ entry.category }}: {{ entry.hours }} hours
        <button @click="editEntry(entry)">Edit</button>
      </div>
    </div>

    <div v-if="editMode">
      <h2>Edit Time Entry</h2>
      <input type="date" v-model="selectedEntry.date" />
      <select v-model="selectedEntry.category">
        <option v-for="category in categories" :key="category">{{ category }}</option>
      </select>
      <input type="number" v-model="selectedEntry.hours" placeholder="Hours" />
      <button @click="updateEntry">Update</button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  setup() {
    const categories = ref(['Work', 'Personal', 'Study', 'Other']);
    const timeEntries = ref([]);
    const newEntry = ref({ date: '', category: '', hours: '' });
    const editMode = ref(false);
    const selectedEntry = ref({});


    const groupedTimeEntries = computed(() => {
      const grouped = {};
      timeEntries.value.forEach(entry => {
        const weekStartDate = new Date(entry.date);
        weekStartDate.setHours(0, 0, 0, 0);
        weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay());
        const key = weekStartDate.toISOString().slice(0, 10);
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(entry);
      });
      return Object.values(grouped);
    });

    const saveEntry = () => {
      const newId = timeEntries.value.length + 1;
      const entry = {
        id: newId,
        date: newEntry.value.date,
        category: newEntry.value.category,
        hours: newEntry.value.hours,
      };
      timeEntries.value.push(entry);
      newEntry.value = { date: '', category: '', hours: '' };
    };

    const editEntry = (entry) => {
      selectedEntry.value = { ...entry };
      editMode.value = true;
    };

    const updateEntry = () => {
      const index = timeEntries.value.findIndex(entry => entry.id === selectedEntry.value.id);
      timeEntries.value[index] = { ...selectedEntry.value };
      editMode.value = false;
    };

    return {
      categories,
      timeEntries,
      newEntry,
      editMode,
      selectedEntry,
      groupedTimeEntries,
      saveEntry,
      editEntry,
      updateEntry,
    };
  },
};
</script>

<style>

body {
  font-family: Arial, sans-serif;
}

h2 {
  color: #333;
}

input, select, button {
  margin: 5px;
}

button {
  padding: 5px 10px;
  cursor: pointer;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 5px 0;
}

div {
  margin: 10px 0;
}
</style>