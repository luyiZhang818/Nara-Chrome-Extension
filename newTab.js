document.addEventListener("DOMContentLoaded", () => {
  const categoriesContainer = document.getElementById("categories-container");
  const tasksContainer = document.getElementById("tasks-container");
  const taskList = document.getElementById("task-list");

  // Background images
  const backgrounds = [
    "assets/original.jpg",
    "assets/img1.jpg",
    "assets/img2.jpg",
    "assets/img3.jpg",
    "assets/img4.jpg",
    "assets/img5.jpg",
    "assets/final.jpg",
  ];

  // Predefined hardcoded tasks
  const hardcodedTasks = {
    daily: [
      "Wake up",
      "Exercise",
      "Eat breakfast",
      "Plan the day",
      "Start work",
    ],
    home: [
      "Clean kitchen",
      "Do laundry",
      "Vacuum",
      "Organize shelves",
      "Water plants",
    ],
    pet: [
      "Feed pet",
      "Walk pet",
      "Play with pet",
      "Clean litter box",
      "Visit vet",
    ],
    friends: [
      "Call a friend",
      "Plan a hangout",
      "Write a letter",
      "Send a gift",
      "Catch up online",
    ],
    mind: [
      "Meditate",
      "Read a book",
      "Journal thoughts",
      "Learn something new",
      "Practice gratitude",
    ],
  };

  // Load saved state from chrome.storage.local
  chrome.storage.local.get("state", (data) => {
    if (data.state) {
      const {
        tasks,
        backgroundIndex,
        categoriesHidden,
        isFinalImage,
        selectedCategory,
      } = data.state;

      if (isFinalImage) {
        // If all tasks are completed, show the final image and hide categories
        document.body.style.backgroundImage = `url(${
          backgrounds[backgrounds.length - 1]
        })`;
        tasksContainer.classList.add("hidden");
        categoriesContainer.classList.add("hidden");
      } else {
        // Restore tasks, background, and categories visibility
        renderTasks(tasks, backgroundIndex, selectedCategory);
        if (categoriesHidden) {
          categoriesContainer.classList.add("hidden");
        }
        document.body.style.backgroundImage = `url(${backgrounds[backgroundIndex]})`;
      }
    } else {
      // Show categories for the initial state
      categoriesContainer.classList.remove("hidden");
      document.body.style.backgroundImage = `url(${backgrounds[0]})`;
    }
  });

  categoriesContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("category-button")) {
      const category = event.target.dataset.category;

      if (category === "others") {
        const customTask = prompt("Enter a custom task:");
        if (customTask) {
          chrome.runtime.sendMessage({
            action: "generateSubtasks",
            task: customTask,
          });
        }
      } else {
        const tasks = hardcodedTasks[category].map((task) => ({
          text: task,
          completed: false,
        }));
        chrome.storage.local.set({
          state: {
            tasks,
            backgroundIndex: 0,
            categoriesHidden: true,
            isFinalImage: false,
            selectedCategory: category, // Add the selected category here
          },
        });
        renderTasks(tasks, 0, category);
      }

      categoriesContainer.classList.add("hidden"); // Hide categories
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updateSubtasks") {
      const tasks = message.subtasks.map((task) => ({
        text: task,
        completed: false,
      }));
      chrome.storage.local.set({
        state: {
          tasks,
          backgroundIndex: 0,
          categoriesHidden: true,
          isFinalImage: false,
          selectedCategory: "others", // Add the selected category here
        },
      });
      renderTasks(tasks, 0, "self");
    }
  });

  function renderTasks(tasks, backgroundIndex, category) {
    const tasksHeader =
      document.getElementById("tasks-header") || document.createElement("div");
    tasksHeader.id = "tasks-header";
    tasksHeader.innerHTML = `
      <h1 class="task-title">Take care of your ${category}</h1>
      <p class="task-subtitle">Do these small and simple tasks to start your day</p>
    `;

    // If this is the first render, set up the container structure
    if (!document.getElementById("tasks-header")) {
      tasksContainer.innerHTML = "";
      tasksContainer.appendChild(tasksHeader);

      const newTaskList = document.createElement("ul");
      newTaskList.id = "task-list";
      tasksContainer.appendChild(newTaskList);
    }

    // Now we can safely get the task list reference
    const taskListElement = document.getElementById("task-list");
    taskListElement.innerHTML = ""; // Clear existing tasks

    tasks.forEach((task, index) => {
      const taskItem = document.createElement("li");
      taskItem.classList.add("draggable");
      taskItem.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""} />
        <input type="text" value="${task.text}" class="task-text" />
        ${
          task.text && !task.completed
            ? `<button class="delete-task"></button>`
            : ""
        }
      `;

      taskItem.draggable = true; // Make task draggable
      taskItem.dataset.index = index; // Store task index for drag-and-drop

      // Handle task completion
      const checkbox = taskItem.querySelector("input[type='checkbox']");
      checkbox.addEventListener("change", () => {
        tasks[index].completed = checkbox.checked;

        // Remove the delete button for checked tasks
        if (tasks[index].completed) {
          const deleteButton = taskItem.querySelector(".delete-task");
          if (deleteButton) deleteButton.remove();
        }

        // Update background based on the number of completed tasks
        const completedTasks = tasks.filter(
          (task) => task.completed && task.text.trim() !== ""
        ).length;
        const totalTasksWithContent = tasks.filter(
          (task) => task.text.trim() !== ""
        ).length;

        if (
          completedTasks === totalTasksWithContent &&
          totalTasksWithContent > 0
        ) {
          // If all tasks with content are completed, show the final image
          document.body.style.backgroundImage = `url(${
            backgrounds[backgrounds.length - 1]
          })`;
          tasksContainer.classList.add("hidden");
          categoriesContainer.classList.add("hidden");
          isFinalImage = true;
        } else {
          // Update background to match current state
          backgroundIndex = Math.min(completedTasks, backgrounds.length - 1);
          document.body.style.backgroundImage = `url(${backgrounds[backgroundIndex]})`;
          isFinalImage = false;
        }

        // Save the updated state
        chrome.storage.local.set({
          state: {
            tasks,
            backgroundIndex,
            categoriesHidden: true,
            isFinalImage,
            selectedCategory: category, // Add the selected category here
          },
        });
      });

      // Handle task text editing
      const taskTextInput = taskItem.querySelector(".task-text");
      taskTextInput.addEventListener("change", () => {
        tasks[index].text = taskTextInput.value;

        // Check if the task already has a delete button
        const existingDeleteButton = taskItem.querySelector(".delete-task");

        // If content is added to a new bar and no delete button exists, add one
        if (
          tasks[index].text.trim() !== "" &&
          !tasks[index].completed &&
          !existingDeleteButton
        ) {
          const deleteButton = document.createElement("button");
          deleteButton.className = "delete-task";
          deleteButton.addEventListener("click", () => {
            tasks.splice(index, 1); // Remove the task

            // Add a new empty task to maintain 5 tasks
            if (tasks.length < 5) {
              tasks.push({ text: "", completed: false });
            }

            // Save the updated state
            chrome.storage.local.set({
              state: {
                tasks,
                backgroundIndex,
                categoriesHidden: true,
                isFinalImage: false,
                selectedCategory: category,
              },
            });

            // Re-render tasks to reflect the changes
            renderTasks(tasks, backgroundIndex);
          });
          taskItem.appendChild(deleteButton);
        }

        // Save the updated state
        chrome.storage.local.set({
          state: {
            tasks,
            backgroundIndex,
            categoriesHidden: true,
            isFinalImage: false,
            selectedCategory: category, // Add the selected category here
          },
        });
      });

      // Handle task deletion (only for non-empty, unchecked tasks)
      const deleteButton = taskItem.querySelector(".delete-task");
      if (deleteButton) {
        deleteButton.addEventListener("click", () => {
          tasks.splice(index, 1); // Remove the task

          // Add a new empty task to maintain 5 tasks
          if (tasks.length < 5) {
            tasks.push({ text: "", completed: false });
          }

          // Save the updated state
          chrome.storage.local.set({
            state: {
              tasks,
              backgroundIndex,
              categoriesHidden: true,
              isFinalImage: false,
              selectedCategory: category, // Add the selected category here
            },
          });

          // Re-render tasks to reflect the changes
          renderTasks(tasks, backgroundIndex);
        });
      }

      taskListElement.appendChild(taskItem);
    });

    // Initialize SortableJS
    new Sortable(taskListElement, {
      animation: 600, // Animation speed
      easing: "cubic-bezier(0.22, 1, 0.36, 1)", // Smooth easing effect
      ghostClass: "sortable-ghost", // Class for the placeholder
      chosenClass: "sortable-chosen", // Class for the chosen item

      onUpdate: (evt) => {
        const [movedTask] = tasks.splice(evt.oldIndex, 1);
        tasks.splice(evt.newIndex, 0, movedTask);

        chrome.storage.local.set({
          state: {
            tasks,
            backgroundIndex,
            categoriesHidden: true,
            isFinalImage: false,
            selectedCategory: category, // Add the selected category here
          },
        });
      },
    });

    tasksContainer.classList.remove("hidden"); // Show tasks
  }
});
