document.addEventListener("DOMContentLoaded", () => {
  // 1. DOM Elements and Constants
  const backgroundContainer = document.createElement("div");
  backgroundContainer.className = "background-container";
  document.body.appendChild(backgroundContainer);

  const categoriesContainer = document.getElementById("categories-container");
  const tasksContainer = document.getElementById("tasks-container");
  const taskList = document.getElementById("task-list");
  const resetButton = document.getElementById("reset-button");
  const resetModal = document.getElementById("reset-modal");
  const resetYesButton = document.getElementById("reset-yes");
  const resetNoButton = document.getElementById("reset-no");

  const originalImageWidth = 1456;
  const originalImageHeight = 816;

  let hoverListeners = [];
  let sortableInstance = null;
  let deerAreas = [];
  let debugMode = false;

  // Initial background image with 5 deers
  const initialBackground = "assets/original.jpg";

  // Background images for each category
  const backgroundSets = {
    daily: [
      "assets/A.png",
      "assets/A1.png",
      "assets/A2.png",
      "assets/A3.png",
      "assets/A4.png",
      "assets/A5.png",
    ],
    home: [
      "assets/B.png",
      "assets/B1.png",
      "assets/B2.png",
      "assets/B3.png",
      "assets/B4.png",
      "assets/B5.png",
    ],
    pet: [
      "assets/C.png",
      "assets/C1.png",
      "assets/C2.png",
      "assets/C3.png",
      "assets/C4.png",
      "assets/C5.png",
    ],
    friends: [
      "assets/D.png",
      "assets/D1.png",
      "assets/D2.png",
      "assets/D3.png",
      "assets/D4.png",
      "assets/D5.png",
    ],
    mind: [
      "assets/E.png",
      "assets/E1.png",
      "assets/E2.png",
      "assets/E3.png",
      "assets/E4.png",
      "assets/E5.png",
    ],
    others: [
      "assets/F.png",
      "assets/F1.png",
      "assets/F2.png",
      "assets/F3.png",
      "assets/F4.png",
      "assets/F5.png",
    ],
  };

  // Deer area configuration
  const baseDeerAreas = [
    {
      id: "deer1",
      baseTop: 55, // percentage from top
      baseLeft: 25, // percentage from left
      baseWidth: 12,
      baseHeight: 25,
      circleImage: "assets/circle_selfcare.png",
      category: "daily",
    },
    {
      id: "deer2",
      baseTop: 54,
      baseLeft: 85,
      baseWidth: 10,
      baseHeight: 23,
      circleImage: "assets/circle_lovedones.png",
      category: "friends",
    },
    {
      id: "deer3",
      baseTop: 69,
      baseLeft: 76,
      baseWidth: 6,
      baseHeight: 12,
      circleImage: "assets/circle_pets.png",
      category: "pet",
    },
    {
      id: "deer4",
      baseTop: 59,
      baseLeft: 47,
      baseWidth: 8,
      baseHeight: 17,
      circleImage: "assets/circle_thehome.png",
      category: "home",
    },
    {
      id: "deer5",
      baseTop: 61,
      baseLeft: 65,
      baseWidth: 8,
      baseHeight: 16,
      circleImage: "assets/circle_themind.png",
      category: "mind",
    },
    {
      id: "deer6",
      baseTop: 3,
      baseLeft: 70,
      baseWidth: 15,
      baseHeight: 15,
      circleImage: "assets/circle_somethingelse.png",
      category: "others",
    },
  ];

  // Task collections
  const taskPool = {
    daily: [
      "Brush teeth for two minutes",
      "Take a relaxing shower",
      "Eat a yummy breakfast",
      "Go for a refreshing 20 minute walk",
      "Change into your favorite outfit",
      "Brush your beautiful hair",
      "Floss between all your teeth",
      "Drink three full glasses of water",
      "Eat a serving of fruits or vegetables",
      "Tidy up your bed",
      "Trim your nails",
      "Moisturize your face and body",
      "Take your medications or vitamins",
      "Put on sunscreen",
      "Take five minutes to shave",
    ],
    home: [
      "Wipe down kitchen counters and stove",
      "Vacuum your space",
      "Empty trash bins and replace bags",
      "Load or unload the dishwasher",
      "Make your bed",
      "Clean your bathroom sink, mirror, and toilet",
      "Sweep or mop the floors",
      "Stow away your clutter",
      "Wipe dining table and chairs",
      "Clean the inside of the microwave",
      "Sort mail and papers",
      "Water your plants",
      "Do a quick dusting of surfaces",
      "Put all your stray clothes in the hamper",
      "Organize your desk",
      "Do a load of laundry",
      "Wipe your electronic surfaces clean",
    ],
    pet: [
      "Provide fresh water in bowl",
      "Clean feeding area",
      "Brush fur",
      "Have dedicated playtime together",
      "Give healthy treats as rewards",
      "Monitor food and water intake",
      "Give pets attention and affection",
      "Check skin/coat for any abnormalities",
    ],
    friends: [
      "Send a thoughtful text message to someone you love",
      "Schedule a catch-up call/coffee",
      "Tell someone a nice compliment",
      "Wish someone a happy birthday today",
      "Give a meaningful compliment",
      "Share a memory/photo with someone",
      "Write a handwritten note",
      "Plan a meetup with some friends",
      "Send a short text to a friend you have not heard from lately",
      "Congratulate someone on a recent achievement",
    ],
    mind: [
      "Take 5 minutes to practice mindful breathing",
      "Write 3 things you are grateful for",
      "Listen to calming music",
      "Practice a 5 minute meditation",
      "Journal your current feelings down for ten minutes",
      "Read a chapter of your new book",
      "Follow a 10 minute stretching Youtube video",
      "Write down a list of 3 affirmations for yourself",
      "Organize one small space in your home",
      "Go outside for at least 20 minutes of fresh air",
      "Do one creative activity",
      "Practice Duolingo for 10 minutes",
    ],
  };
  const hardcodedTasks = {
    daily: getRandomTasks("daily"),
    home: getRandomTasks("home"),
    pet: getRandomTasks("pet"),
    friends: getRandomTasks("friends"),
    mind: getRandomTasks("mind"),
  };

  const moodPicker = document.getElementById("mood-picker");

  const speechBubble = document.getElementById("speech-bubble");
  const encouragements = [
    "Great job!",
    "You’re making progress!",
    "Keep going!",
    "Nice work!",
    "Almost there!"
  ];

  const categoryDeerMap = {
    daily:  "deer1",
    friends:"deer2",
    pet:    "deer3",
    home:   "deer4",
    mind:   "deer5",
    others: "deer6"
  };

  // 2. Utility functions
  function parsePercentage(value) {
    return parseFloat(value.replace("%", ""));
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = reject;
      img.src = url;
    });
  }

  // Load saved mood
chrome.storage.local.get("mood", ({ mood }) => {
  if (mood) {
    const el = moodPicker.querySelector(`[data-mood="${mood}"]`);
    if (el) el.classList.add("selected");
  }
});

  // Handle clicks
  moodPicker.addEventListener("click", (e) => {
    if (!e.target.matches(".mood-icon")) return;
    // clear previous
    moodPicker.querySelectorAll(".mood-icon").forEach(i => i.classList.remove("selected"));
    e.target.classList.add("selected");

    const choice = e.target.dataset.mood;
    chrome.storage.local.set({ mood: choice });
  });


  // 3. Hover-related Functions
  function calculateResponsivePositions() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportAspect = viewportWidth / viewportHeight;
    const imageAspect = originalImageWidth / originalImageHeight;

    let scaledWidth, scaledHeight, offsetX, offsetY;

    // Calculate how the image is actually rendered
    if (viewportAspect > imageAspect) {
      // Image scaled to viewport width (cropped vertically)
      scaledWidth = viewportWidth;
      scaledHeight = viewportWidth / imageAspect;
      offsetX = 0;
      offsetY = (scaledHeight - viewportHeight) / 2;
    } else {
      // Image scaled to viewport height (cropped horizontally)
      scaledHeight = viewportHeight;
      scaledWidth = viewportHeight * imageAspect;
      offsetY = 0;
      offsetX = (scaledWidth - viewportWidth) / 2;
    }

    return baseDeerAreas.map((deer) => {
      // Convert original percentages to pixels in scaled image
      const originalLeft = (deer.baseLeft / 100) * originalImageWidth;
      const originalTop = (deer.baseTop / 100) * originalImageHeight;
      const originalWidth = (deer.baseWidth / 100) * originalImageWidth;
      const originalHeight = (deer.baseHeight / 100) * originalImageHeight;

      // Scale coordinates to rendered image size
      const scaledLeft = (originalLeft / originalImageWidth) * scaledWidth;
      const scaledTop = (originalTop / originalImageHeight) * scaledHeight;
      const scaledWidthPx = (originalWidth / originalImageWidth) * scaledWidth;
      const scaledHeightPx =
        (originalHeight / originalImageHeight) * scaledHeight;

      // Convert to viewport coordinates (account for cropping)
      const viewportLeft = scaledLeft - offsetX;
      const viewportTop = scaledTop - offsetY;

      // Calculate visible area bounds
      const visibleLeft = Math.max(viewportLeft, 0);
      const visibleTop = Math.max(viewportTop, 0);
      const visibleRight = Math.min(
        viewportLeft + scaledWidthPx,
        viewportWidth
      );
      const visibleBottom = Math.min(
        viewportTop + scaledHeightPx,
        viewportHeight
      );

      return {
        id: deer.id,
        visible: visibleLeft < visibleRight && visibleTop < visibleBottom,
        left: visibleLeft,
        top: visibleTop,
        width: visibleRight - visibleLeft,
        height: visibleBottom - visibleTop,
        circleImage: deer.circleImage,
        category: deer.category,
      };
    });
  }

  function checkHover(e, area) {
    if (!area.visible) return false;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    return (
      mouseX >= area.left &&
      mouseX <= area.left + area.width &&
      mouseY >= area.top &&
      mouseY <= area.top + area.height
    );
  }

  function removeAllListeners() {
    hoverListeners.forEach((listener) => {
      document.removeEventListener("mousemove", listener);
      document.removeEventListener("click", listener);
    });
    hoverListeners = [];
  }

  function initializeDeerAreas() {
    deerAreas = calculateResponsivePositions();

    deerAreas.forEach((area) => {
      const circle = document.getElementById(`${area.id}-circle`);
      if (!circle) return;

      circle.style.backgroundImage = `url(${area.circleImage})`;

      const handleMouseMove = (e) => {
        if (checkHover(e, area)) {
          const circle = document.getElementById(`${area.id}-circle`);
          if (circle) {
            const originalWidth = area.width; // Already in pixels
            const originalHeight = area.height; // Already in pixels

            const newWidth = originalWidth * 1.7;
            const newHeight = originalHeight * 1.7;

            // Calculate positions using PIXELS
            const centerX = area.left + originalWidth / 2;
            const centerY = area.top + originalHeight / 2;

            const newLeft = centerX - newWidth / 2;
            const newTop = centerY - newHeight / 2 + newHeight * 0.05;

            circle.style.transition =
              "width 0.3s ease, height 0.3s ease, left 0.3s ease, top 0.3s ease";
            circle.style.width = `${newWidth}px`; // Changed to px
            circle.style.height = `${newHeight}px`; // Changed to px
            circle.style.left = `${newLeft}px`; // Changed to px
            circle.style.top = `${newTop}px`; // Changed to px
            circle.classList.add("active");
          }
        } else {
          const circle = document.getElementById(`${area.id}-circle`);
          if (circle) {
            circle.style.transition = "none";
            // Reset to original PIXEL values
            circle.style.width = `${area.width}px`; // Changed to px
            circle.style.height = `${area.height}px`; // Changed to px
            circle.style.left = `${area.left}px`; // Changed to px
            circle.style.top = `${area.top}px`; // Changed to px

            void circle.offsetWidth; // Force reflow

            circle.style.transition =
              "width 0.3s ease, height 0.3s ease, left 0.3s ease, top 0.3s ease";
            circle.classList.remove("active");
          }
        }
      };
      const handleClick = (e) => {
        if (!circle.classList.contains("hidden") && checkHover(e, area)) {
          const categoryButton = document.querySelector(
            `.category-button[data-category="${area.category}"]`
          );
          if (categoryButton) {
            categoryButton.click();
            removeAllListeners();
          }
        }
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("click", handleClick);
      hoverListeners.push(handleMouseMove, handleClick);
    });
  }

  function handleResize() {
    deerAreas = calculateResponsivePositions();

    deerAreas.forEach((area) => {
      const circle = document.getElementById(`${area.id}-circle`);
      if (!circle) return;

      circle.style.display = area.visible ? "block" : "none";
      circle.style.left = `${area.left}px`;
      circle.style.top = `${area.top}px`;
      circle.style.width = `${area.width}px`;
      circle.style.height = `${area.height}px`;
    });
  }

  function createDebugOverlays() {
    // Remove any existing debug overlays
    const existingOverlays = document.querySelectorAll(".debug-overlay");
    existingOverlays.forEach((overlay) => overlay.remove());

    // Create debug overlays for each deer area
    deerAreas.forEach((area, index) => {
      const overlay = document.createElement("div");
      overlay.className = "debug-overlay";
      overlay.style.position = "absolute";
      overlay.style.border = "2px solid red";
      overlay.style.background = "rgba(255, 0, 0, 0.2)";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "9999";

      overlay.style.left = `${area.left}px`; // Add px
      overlay.style.top = `${area.top}px`; // Add px
      overlay.style.width = `${area.width}px`; // Add px
      overlay.style.height = `${area.height}px`; // Add px

      const label = document.createElement("div");
      label.style.position = "absolute";
      label.style.top = "0";
      label.style.left = "0";
      label.style.background = "rgba(255, 255, 255, 0.8)";
      label.style.padding = "2px 5px";
      label.style.fontSize = "12px";
      label.textContent = `Deer ${index + 1}`;
      overlay.appendChild(label);

      document.body.appendChild(overlay);
    });
  }

  // Debounce function to prevent too many resize calculations
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 4. UI Management Functions
  function hideHoverCircles() {
    const hoverCircles = document.querySelectorAll(".deer-circle");
    hoverCircles.forEach((circle) => {
      circle.classList.add("hidden");
    });
  }

  function showHoverCircles() {
    const hoverCircles = document.querySelectorAll(".deer-circle");
    hoverCircles.forEach((circle) => {
      circle.classList.remove("hidden");
    });
  }

  async function changeBackgroundWithSlide(newImageUrl) {
    try {
      // Preload the new image first
      await preloadImage(newImageUrl);

      return new Promise((resolve) => {
        const currentBg =
          backgroundContainer.querySelector(".background-slide");
        const newBg = document.createElement("div");
        newBg.className = "background-slide";

        // Set initial opacity to 0
        newBg.style.opacity = "0";
        newBg.style.backgroundImage = `url(${newImageUrl})`;

        // Add the new background
        backgroundContainer.appendChild(newBg);

        // Force a reflow to ensure the opacity transition works
        newBg.offsetHeight;

        // Fade in the new background
        requestAnimationFrame(() => {
          newBg.style.opacity = "1";

          if (currentBg) {
            // Start fading out the old background
            currentBg.style.opacity = "0";

            // Remove the old background after transition
            currentBg.addEventListener(
              "transitionend",
              () => {
                currentBg.remove();
                resolve();
              },
              { once: true }
            );
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error("Error loading image:", error);
      return Promise.resolve();
    }
  }

  // 5. Task Management and Background State Functions
  function getRandomTasks(category) {
    const tasks = taskPool[category];
    return shuffleArray([...tasks]).slice(0, 5);
  }

  function updateBackgroundState(tasks, selectedCategory) {
    const tasksWithContent = tasks.filter((task) => task.text.trim() !== "");
    const completedTasks = tasks.filter(
      (task) => task.completed && task.text.trim() !== ""
    ).length;
    const totalTasksWithContent = tasksWithContent.length;

    let backgroundIndex;
    let isFinalImage = false;

    if (selectedCategory === "others") {
      // For "others" category, increment background based on completed tasks
      backgroundIndex = Math.min(
        completedTasks,
        backgroundSets[selectedCategory].length - 2
      );

      // Only show final image when ALL tasks with content are completed
      if (
        completedTasks === totalTasksWithContent &&
        totalTasksWithContent > 0
      ) {
        backgroundIndex = backgroundSets[selectedCategory].length - 1;
        isFinalImage = true;
      }
    } else {
      // Original logic for other categories
      if (
        completedTasks === totalTasksWithContent &&
        totalTasksWithContent > 0
      ) {
        backgroundIndex = backgroundSets[selectedCategory].length - 1;
        isFinalImage = true;
      } else {
        backgroundIndex = Math.min(
          completedTasks,
          backgroundSets[selectedCategory].length - 1
        );
      }
    }

    return { backgroundIndex, isFinalImage };
  }

  function sortTasksByCompletion(tasks) {
    return [...tasks].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? -1 : 1;
    });
  }
  
  function showEncouragement(deerId) {
    const deerEl = document.getElementById(`${deerId}-circle`);
    if (!deerEl) return;
    const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
  
    // position near deer
    const rect = deerEl.getBoundingClientRect();
    speechBubble.textContent = msg;
    speechBubble.style.left  = `${rect.right + 8}px`;
    speechBubble.style.top   = `${rect.top - 4}px`;
    speechBubble.classList.remove("hidden");
    speechBubble.classList.add("visible");
  
    // hide after 2s
    setTimeout(() => {
      speechBubble.classList.remove("visible");
      speechBubble.classList.add("hidden");
    }, 2000);
  }

  function renderTasks(tasks, backgroundIndex, category) {
    const tasksHeader =
      document.getElementById("tasks-header") || document.createElement("div");
    tasksHeader.id = "tasks-header";
    tasksHeader.innerHTML = `
      <h1 class="task-title">today's list</h1>
      <p class="task-subtitle">some tasks to help you feel good</p>
    `;

    if (!document.getElementById("tasks-header")) {
      tasksContainer.innerHTML = "";
      tasksContainer.appendChild(tasksHeader);

      const newTaskList = document.createElement("ul");
      newTaskList.id = "task-list";
      tasksContainer.appendChild(newTaskList);
    }

    const taskListElement = document.getElementById("task-list");
    taskListElement.innerHTML = "";

    const sortedTasks = sortTasksByCompletion(tasks);

    sortedTasks.forEach((task, index) => {
      const taskItem = document.createElement("li");
      taskItem.classList.add("draggable");
      taskItem.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""} />
        <div class="task-text" contenteditable="true" placeholder="New task">${
          task.text
        }</div>
        ${
          task.text && !task.completed
            ? `<button class="delete-task"></button>`
            : ""
        }
        <div class="drag-handle">
         <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div>
      `;

      taskItem.draggable = true;
      taskItem.dataset.index = tasks.indexOf(task);

      const checkbox = taskItem.querySelector("input[type='checkbox']");
      checkbox.addEventListener("change", () => {
        const originalIndex = tasks.indexOf(task);
        tasks[originalIndex].completed = checkbox.checked;

        if (tasks[originalIndex].completed) {
          showEncouragement(categoryDeerMap[category]);
          const deleteButton = taskItem.querySelector(".delete-task");
          if (deleteButton) deleteButton.remove();
        }

        let newPosition = 0;
        if (checkbox.checked) {
          newPosition = tasks.filter(
            (t, i) => t.completed && i < originalIndex
          ).length;
        } else {
          newPosition = tasks.filter((t) => t.completed).length;
        }

        const [movedTask] = tasks.splice(originalIndex, 1);
        tasks.splice(newPosition, 0, movedTask);

        const { backgroundIndex: newBackgroundIndex, isFinalImage } =
          updateBackgroundState(tasks, category);

        if (isFinalImage) {
          changeBackgroundWithSlide(
            backgroundSets[category][backgroundSets[category].length - 1]
          ).then(() => {
            tasksContainer.classList.add("hidden");
            categoriesContainer.classList.add("hidden");
            hideHoverCircles(); // Hide hover circles when the final image is shown
            document.getElementById("welcome-message").classList.add("hidden");
            // Create and show thank you message
            const thankYouMessage = document.createElement("div");
            thankYouMessage.className = "thank-you-message";
            thankYouMessage.textContent =
              "Thank you for taking good care of me";
            document.body.appendChild(thankYouMessage);
          });
        } else {
          changeBackgroundWithSlide(
            backgroundSets[category][newBackgroundIndex]
          );
        }

        chrome.storage.local.set({
          state: {
            tasks,
            backgroundIndex: newBackgroundIndex,
            categoriesHidden: true,
            isFinalImage,
            selectedCategory: category,
          },
        });

        if (sortableInstance) {
          const taskItems = Array.from(taskListElement.children);
          const oldItemEl = taskItems[originalIndex];

          taskListElement.removeChild(oldItemEl);
          taskListElement.insertBefore(
            oldItemEl,
            taskListElement.children[newPosition]
          );

          sortableInstance.option("animation", 600);
          sortableInstance.option("onEnd", null);
          const evt = new CustomEvent("sortable:start");
          taskListElement.dispatchEvent(evt);

          oldItemEl.style.transition = "all 600ms ease";
          oldItemEl.style.animation = "moveTask 600ms ease";

          setTimeout(() => {
            oldItemEl.style.transition = "";
            oldItemEl.style.animation = "";
          }, 600);
        }
      });

      const taskTextInput = taskItem.querySelector(".task-text");
      taskTextInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault(); // Prevent the default behavior (new line)
          taskTextInput.blur(); // Exit edit mode
        }
      });

      taskTextInput.addEventListener("input", () => {
        const originalIndex = tasks.indexOf(task);
        tasks[originalIndex].text = taskTextInput.textContent;

        const existingDeleteButton = taskItem.querySelector(".delete-task");

        if (
          tasks[originalIndex].text.trim() !== "" &&
          !tasks[originalIndex].completed &&
          !existingDeleteButton
        ) {
          const deleteButton = document.createElement("button");
          deleteButton.className = "delete-task";

          deleteButton.addEventListener("click", () => {
            tasks.splice(originalIndex, 1);

            if (tasks.length < 5) {
              tasks.push({ text: "", completed: false });
            }

            const { backgroundIndex: newBackgroundIndex, isFinalImage } =
              updateBackgroundState(tasks, category);

            if (isFinalImage) {
              changeBackgroundWithSlide(
                backgroundSets[category][backgroundSets[category].length - 1]
              ).then(() => {
                tasksContainer.classList.add("hidden");
                categoriesContainer.classList.add("hidden");
                document
                  .getElementById("welcome-message")
                  .classList.add("hidden");
                // Create and show thank you message
                const thankYouMessage = document.createElement("div");
                thankYouMessage.className = "thank-you-message";
                thankYouMessage.textContent =
                  "Thank you for taking good care of me";
                document.body.appendChild(thankYouMessage);
              });
            } else {
              changeBackgroundWithSlide(
                backgroundSets[category][newBackgroundIndex]
              );
            }

            chrome.storage.local.set({
              state: {
                tasks,
                backgroundIndex: newBackgroundIndex,
                categoriesHidden: true,
                isFinalImage,
                selectedCategory: category,
              },
            });

            renderTasks(tasks, backgroundIndex, category);
          });
          taskItem.appendChild(deleteButton);
        }

        chrome.storage.local.set({
          state: {
            tasks,
            backgroundIndex,
            categoriesHidden: true,
            isFinalImage: false,
            selectedCategory: category,
          },
        });
      });

      const deleteButton = taskItem.querySelector(".delete-task");
      if (deleteButton) {
        deleteButton.addEventListener("click", () => {
          const originalIndex = tasks.indexOf(task);
          tasks.splice(originalIndex, 1);

          if (tasks.length < 5) {
            tasks.push({ text: "", completed: false });
          }

          const { backgroundIndex: newBackgroundIndex, isFinalImage } =
            updateBackgroundState(tasks, category);

          if (isFinalImage) {
            changeBackgroundWithSlide(
              backgroundSets[category][backgroundSets[category].length - 1]
            ).then(() => {
              tasksContainer.classList.add("hidden");
              categoriesContainer.classList.add("hidden");
              document
                .getElementById("welcome-message")
                .classList.add("hidden");
              // Create and show thank you message
              const thankYouMessage = document.createElement("div");
              thankYouMessage.className = "thank-you-message";
              thankYouMessage.textContent =
                "Thank you for taking good care of me";
              document.body.appendChild(thankYouMessage);
            });
          } else {
            changeBackgroundWithSlide(
              backgroundSets[category][newBackgroundIndex]
            );
          }

          chrome.storage.local.set({
            state: {
              tasks,
              backgroundIndex: newBackgroundIndex,
              categoriesHidden: true,
              isFinalImage,
              selectedCategory: category,
            },
          });

          renderTasks(tasks, newBackgroundIndex, category);
        });
      }

      taskListElement.appendChild(taskItem);

      if (!document.querySelector("#task-animations")) {
        const style = document.createElement("style");
        style.id = "task-animations";
        style.textContent = `
          @keyframes moveTask {
            0% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
            100% {
              transform: translateY(0);
            }
          }
        `;
        document.head.appendChild(style);
      }
    });

    // Initialize or update SortableJS
    if (sortableInstance) {
      sortableInstance.destroy();
    }

    sortableInstance = new Sortable(taskListElement, {
      animation: 600,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",

      onUpdate: (evt) => {
        const [movedTask] = tasks.splice(evt.oldIndex, 1);
        tasks.splice(evt.newIndex, 0, movedTask);

        const { backgroundIndex: newBackgroundIndex, isFinalImage } =
          updateBackgroundState(tasks, category);

        if (isFinalImage) {
          changeBackgroundWithSlide(
            backgroundSets[category][backgroundSets[category].length - 1]
          ).then(() => {
            tasksContainer.classList.add("hidden");
            categoriesContainer.classList.add("hidden");
            document.getElementById("welcome-message").classList.add("hidden");
            // Create and show thank you message
            const thankYouMessage = document.createElement("div");
            thankYouMessage.className = "thank-you-message";
            thankYouMessage.textContent =
              "Thank you for taking good care of me";
            document.body.appendChild(thankYouMessage);
          });
        } else {
          changeBackgroundWithSlide(
            backgroundSets[category][newBackgroundIndex]
          );
        }

        chrome.storage.local.set({
          state: {
            tasks,
            backgroundIndex: newBackgroundIndex,
            categoriesHidden: true,
            isFinalImage,
            selectedCategory: category,
          },
        });
      },
    });

    tasksContainer.classList.remove("hidden");
  }
  

  // 6. Event Listeners
  categoriesContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("category-button")) {
      const category = event.target.dataset.category;
      removeAllListeners();
      hideHoverCircles();

      if (category === "others") {
        // Create five empty tasks for the "Others" category
        const tasks = Array(5)
          .fill()
          .map(() => ({
            text: "",
            completed: false,
          }));

        chrome.storage.local.set({
          state: {
            tasks,
            backgroundIndex: 0,
            categoriesHidden: true,
            isFinalImage: false,
            selectedCategory: category,
          },
        });

        // Set the background to the category's origin photo (e.g., A.jpg)
        changeBackgroundWithSlide(backgroundSets[category][0]).then(() => {
          // Render the empty tasks
          renderTasks(tasks, 0, category);
        });
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
            selectedCategory: category,
          },
        });
        // Set the background to the category's origin photo (e.g., A.jpg)
        changeBackgroundWithSlide(backgroundSets[category][0]).then(() => {
          renderTasks(tasks, 0, category);
        });
      }

      categoriesContainer.classList.add("hidden");
      hideHoverCircles();
      document.getElementById("welcome-message").classList.add("hidden");
    }
  });

  resetButton.addEventListener("click", () => {
    resetModal.classList.remove("hidden");
  });

  resetNoButton.addEventListener("click", () => {
    resetModal.classList.add("hidden");
  });

  resetYesButton.addEventListener("click", () => {
    // Clear the state in chrome.storage.local
    chrome.storage.local.set({ state: null }, () => {
      console.log("State reset to initial state.");
    });

    // Reset the UI to the initial state
    tasksContainer.classList.add("hidden");
    document.getElementById("welcome-message").classList.remove("hidden");
    changeBackgroundWithSlide(initialBackground);

    // Remove thank you message if it exists
    const thankYouMessage = document.querySelector(".thank-you-message");
    if (thankYouMessage) {
      thankYouMessage.remove();
    }

    // Reset the deers and hover calculations
    removeAllListeners();
    showHoverCircles();
    initializeDeerAreas();

    // Hide the reset modal
    resetModal.classList.add("hidden");
  });

  // 7. AI Request (TBU)
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
          selectedCategory: "others",
        },
      });
      renderTasks(tasks, 0, "others");
    }
  });

  // 8. DEBUG Mode
  document.addEventListener("keydown", (e) => {
    if (e.key === "d" && e.ctrlKey) {
      debugMode = !debugMode;
      if (debugMode) {
        createDebugOverlays();
      } else {
        const overlays = document.querySelectorAll(".debug-overlay");
        overlays.forEach((overlay) => overlay.remove());
      }
    }
  });

  // Enhanced resize handling
  const enhancedHandleResize = () => {
    handleResize(); // Call the original resize handler
    if (debugMode) {
      createDebugOverlays(); // Update debug overlays if enabled
    }
  };

  // 9. Initialization
  initializeDeerAreas();
  window.addEventListener(
    "resize",
    debounce(() => {
      enhancedHandleResize();
    }, 250)
  );

  // 10. Chrome Storage
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
        removeAllListeners();
        changeBackgroundWithSlide(
          backgroundSets[selectedCategory][
            backgroundSets[selectedCategory].length - 1
          ]
        ).then(() => {
          tasksContainer.classList.add("hidden");
          categoriesContainer.classList.add("hidden");
          hideHoverCircles(); // Hide hover circles when the final image is shown
          document.getElementById("welcome-message").classList.add("hidden");

          // Create and show thank you message
          const thankYouMessage = document.createElement("div");
          thankYouMessage.className = "thank-you-message";
          thankYouMessage.textContent = "Thank you for taking good care of me";
          document.body.appendChild(thankYouMessage);
        });
      } else {
        renderTasks(tasks, backgroundIndex, selectedCategory);
        if (categoriesHidden) {
          categoriesContainer.classList.add("hidden");
          hideHoverCircles(); // Hide hover circles when categories are hidden
          document.getElementById("welcome-message").classList.add("hidden");
        }
        changeBackgroundWithSlide(
          backgroundSets[selectedCategory][backgroundIndex]
        );
      }
    } else {
      //categoriesContainer.classList.remove("hidden");
      document.getElementById("welcome-message").classList.remove("hidden");
      showHoverCircles(); // Show hover circles in the initial state
      changeBackgroundWithSlide(initialBackground);
    }
  });
});
