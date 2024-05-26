<template>
  <div>
    <h2>Track Time</h2>
    <input type="date" v-model="newEntry.date" />
    <select v-model="newEntry.category">
      <option v-for="category in categories" :key="category">{{ category }}</option>
    </select>
    <div v-if="!isTiming">
      <button @click="startTimer">Start Timer</button>
    </div>
    <div v-else>
      <p>Time: {{ formatTime(elapsedTime) }}</p>
      <button @click="stopTimer">Stop Timer</button>
    </div>

    <h2>Existing Time Entries</h2>
    <div v-for="(weekEntries, week) in groupedTimeEntries" :key="week" class="week-group">
      <h3>Week of {{ week }}</h3>
      <div v-for="entry in weekEntries" :key="entry.id" class="entry">
        {{ entry.date }} - {{ entry.category }}: {{ formatTime(entry.seconds) }}
        <button @click="editEntry(entry)">Edit</button>
      </div>
    </div>

    <div v-if="editMode">
      <h2>Edit Time Entry</h2>
      <input type="date" v-model="selectedEntry.date" />
      <select v-model="selectedEntry.category">
        <option v-for="category in categories" :key="category">{{ category }}</option>
      </select>
      <input type="number" v-model="selectedEntry.seconds" placeholder="Seconds" />
      <button @click="updateEntry">Update</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { db } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";

export default {
  setup() {
    const categories = ref(['Work', 'Personal', 'Study', 'Other']);
    const timeEntries = ref([]);
    const newEntry = ref({ date: '', category: '', seconds: 0 });
    const editMode = ref(false);
    const selectedEntry = ref({});
    const isTiming = ref(false);
    const timer = ref(null);
    const startTime = ref(null);
    const elapsedTime = ref(0);

    const fetchDocumentData = async () => {
      try {
        const docRef = doc(db, "timeTracker", "2Dwukm8JIb40EdAG1LmX");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          timeEntries.value = docSnap.data().entries || [];
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    const saveDocumentData = async () => {
      try {
        const docRef = doc(db, "timeTracker", "2Dwukm8JIb40EdAG1LmX");
        await setDoc(docRef, { entries: timeEntries.value });
        console.log("Document data saved!");
      } catch (error) {
        console.error("Error saving document:", error);
      }
    };

    onMounted(fetchDocumentData);

    const startTimer = () => {
      startTime.value = new Date();
      isTiming.value = true;
      timer.value = setInterval(() => {
        const now = new Date();
        elapsedTime.value = Math.floor((now - startTime.value) / 1000);
      }, 1000);
    };

    const stopTimer = () => {
      clearInterval(timer.value);
      saveEntry(elapsedTime.value);
      elapsedTime.value = 0;
      isTiming.value = false;
    };

    const saveEntry = (seconds) => {
      const newId = timeEntries.value.length + 1;
      const entry = {
        id: newId,
        date: newEntry.value.date,
        category: newEntry.value.category,
        seconds,
      };
      timeEntries.value.push(entry);
      newEntry.value = { date: '', category: '', seconds: 0 };
      saveDocumentData();
    };

    const editEntry = (entry) => {
      selectedEntry.value = { ...entry };
      editMode.value = true;
    };

    const updateEntry = () => {
      const index = timeEntries.value.findIndex(entry => entry.id === selectedEntry.value.id);
      if (index !== -1) {

        timeEntries.value = [
          ...timeEntries.value.slice(0, index),
          { ...selectedEntry.value },
          ...timeEntries.value.slice(index + 1)
        ];
        saveDocumentData();
      }
      editMode.value = false;
    };

    const groupedTimeEntries = computed(() => {
      const groups = {};
      timeEntries.value.forEach(entry => {
        const entryDate = new Date(entry.date);
        const weekStartDate = new Date(entryDate);
        const day = weekStartDate.getDay();
        const diff = weekStartDate.getDate() - day + (day === 0 ? -6 : 1);
        weekStartDate.setDate(diff);
        weekStartDate.setHours(0, 0, 0, 0);
        const weekKey = weekStartDate.toISOString().slice(0, 10);
        if (!groups[weekKey]) {
          groups[weekKey] = [];
        }
        groups[weekKey].push(entry);
      });
      return groups;
    });

    const formatTime = (seconds) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs}h ${mins}m ${secs}s`;
    };

    return {
      categories,
      timeEntries,
      newEntry,
      editMode,
      selectedEntry,
      isTiming,
      elapsedTime,
      startTimer,
      stopTimer,
      saveEntry,
      editEntry,
      updateEntry,
      groupedTimeEntries,
      formatTime,
    };
  },
};
</script>

<style>
body {
  font-family: 'Arial', sans-serif;
  background-color: #f4f4f9;
  margin: 0;
  padding: 20px;
  color: #333;
}

h2 {
  color: #444;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

input, select {
  display: block;
  width: calc(100% - 22px);
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}

button {
  display: inline-block;
  padding: 10px 20px;
  margin: 10px 0;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.week-group {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.week-group h3 {
  margin: 0 0 10px 0;
  color: #555;
}

.entry {
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.entry:last-child {
  border-bottom: none;
}

.entry button {
  background-color: #28a745;
  margin-left: 10px;
}

.entry button:hover {
  background-color: #218838;
}
</style>