(() => {
  const events = window.GUNGI_EVENTS || [];
  const presets = window.GUNGI_MAP_PRESETS || {};

  const eventSelect = document.getElementById("eventSelect");
  const nextButton = document.getElementById("nextButton");
  const restartButton = document.getElementById("restartButton");
  const dialogueText = document.getElementById("dialogueText");
  const speakerBadge = document.getElementById("speakerBadge");
  const cutCounter = document.getElementById("cutCounter");
  const eventId = document.getElementById("eventId");
  const eventType = document.getElementById("eventType");
  const eventResult = document.getElementById("eventResult");
  const rikuCard = document.getElementById("rikuCard");
  const minaCard = document.getElementById("minaCard");
  const mapPanel = document.getElementById("mapPanel");
  const poiLayer = document.getElementById("poiLayer");

  let currentEventIndex = 0;
  let currentCutIndex = 0;

  function speakerLabel(speaker) {
    if (speaker === "riku") return "リク";
    if (speaker === "mina") return "ミナ";
    return "SYSTEM";
  }

  function setSpeakerState(speaker) {
    [rikuCard, minaCard].forEach(card => {
      card.classList.remove("is-speaking");
      card.classList.add("is-dim");
    });

    if (speaker === "riku") {
      rikuCard.classList.remove("is-dim");
      rikuCard.classList.add("is-speaking");
    }

    if (speaker === "mina") {
      minaCard.classList.remove("is-dim");
      minaCard.classList.add("is-speaking");
    }
  }

  function setSpeakerBadge(speaker) {
    speakerBadge.className = "speaker-badge";
    if (speaker === "riku") speakerBadge.classList.add("riku");
    if (speaker === "mina") speakerBadge.classList.add("mina");
    speakerBadge.textContent = speakerLabel(speaker);
  }

  function renderMap(presetKey) {
    poiLayer.innerHTML = "";
    const points = presets[presetKey] || [];

    points.forEach(([x, y, kind]) => {
      const poi = document.createElement("i");
      poi.className = `poi ${kind}`;
      poi.style.left = `${x}%`;
      poi.style.top = `${y}%`;
      poiLayer.appendChild(poi);
    });
  }

  function renderEventMeta(event) {
    eventId.textContent = event.id;
    eventType.textContent = event.type;
    eventResult.textContent = event.result;
  }

  function renderCut() {
    const event = events[currentEventIndex];
    const cut = event.cuts[currentCutIndex];

    setSpeakerState(cut.speaker);
    setSpeakerBadge(cut.speaker);

    dialogueText.animate(
      [
        { opacity: 0, transform: "translateY(4px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      { duration: 180, easing: "ease-out" }
    );

    dialogueText.textContent = cut.text;
    cutCounter.textContent = `CUT ${currentCutIndex + 1} / ${event.cuts.length}`;
    mapPanel.dataset.highlight = cut.highlight || "neutral";

    nextButton.textContent = currentCutIndex === event.cuts.length - 1 ? "もう一度" : "次へ";
  }

  function loadEvent(index) {
    currentEventIndex = index;
    currentCutIndex = 0;

    const event = events[index];
    renderMap(event.mapPreset);
    renderEventMeta(event);
    renderCut();
  }

  function populateEventSelect() {
    eventSelect.innerHTML = "";

    events.forEach((event, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${event.id} / ${event.title}`;
      eventSelect.appendChild(option);
    });
  }

  nextButton.addEventListener("click", () => {
    const event = events[currentEventIndex];

    if (currentCutIndex >= event.cuts.length - 1) {
      currentCutIndex = 0;
    } else {
      currentCutIndex += 1;
    }

    renderCut();
  });

  restartButton.addEventListener("click", () => {
    currentCutIndex = 0;
    renderCut();
  });

  eventSelect.addEventListener("change", event => {
    loadEvent(Number(event.target.value));
  });

  if (!events.length) {
    dialogueText.textContent = "軍議イベントデータがありません。";
    nextButton.disabled = true;
    return;
  }

  populateEventSelect();
  loadEvent(0);
})();
