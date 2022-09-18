function clearBox(elementID) {
  document.getElementById(elementID).innerHTML = "";
}

const submit = function (event) {
  event.preventDefault();
  const input = document.querySelector("#fieldname"),
    json = { Task: "submit", Content: input.value },
    body = JSON.stringify(json);

  fetch(`/GetQuest/${input.value}`, {
    method: "GET",
  })
    .then((response) => {
      return response.json();
    })
    .then((res) => {
      const quest = document.body.querySelector("#QuestReceived");
      const Quest = res.Quest;
      quest.innerText = Quest;
    });
};

const GetDB = function (e) {
  e.preventDefault();
  fetch("/GetAll", {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      console.log(res);
      clearBox("database");
      res.forEach((item) => {
        const Q = item.Quest;
        const C = item.Category;
        const D = item.Done;
        var ul = document.createElement("ul");
        ul.innerText = `Quest: ${Q}, Category: ${C}, Done?: ${D}`;
        const db = document.querySelector("#database");
        db.appendChild(ul);
      });
    });
};

const Done = function (e) {
  e.preventDefault();
  const q = document.querySelector("#QuestReceived");
  console.log(q.innerText);
  const json = { Body: q.innerText };
  const body = JSON.stringify(json);

  fetch("/Done", {
    method: "POST",
    body,
  }).then((response) => {
    console.log(response);
  });
  return false;
};

const NotDone = function (e) {
  e.preventDefault();
  const q = document.querySelector("#QuestReceived");
  console.log(q.innerText);
  const json = { Body: q.innerText };
  const body = JSON.stringify(json);

  fetch("/NotDone", {
    method: "POST",
    body,
  }).then((response) => {
    console.log(response);
  });
  return false;
};

const AddQuest = function (e) {
  e.preventDefault();
  const Q_name = document.querySelector("#QuestName");
  const Q_type = document.querySelector("#QuestType");
  const Q_n_str = Q_name.value;
  const Q_t_str = Q_type.value;
  const json = { Quest: Q_n_str, Category: Q_t_str };
  const body = JSON.stringify(json);

  fetch("/AddQuest", {
    method: "POST",
    body,
  }).then((response) => {
    const k = document.querySelector("#QuestName");
    k.value = "";
  });
};

const DeleteQuest = function (e) {
  const Q_name = document.querySelector("#DQuestName");
  const Q_n_str = Q_name.value;
  const json = { Quest: Q_n_str };
  const body = JSON.stringify(json);

  fetch("/DeleteQuest", {
    method: "POST",
    body,
  }).then((response) => {
    console.log("Delete Success.");
    const k = document.querySelector("#QuestName");
    k.value = "";
  });
};

const Loggin = function (e) {
  e.preventDefault();

  fetch(
    "/auth/github",
    { mode: "no-cors" },
    {
      method: "GET",
    }
  ).then(console.log("Loggin clicked"));
};

window.onload = function () {
  const button_submit = document.querySelector("#Submit");
  button_submit.onclick = submit;
  const button_done = document.querySelector("#Done");
  button_done.onclick = Done;
  const button_Notdone = document.querySelector("#NotDone");
  button_Notdone.onclick = NotDone;
  const button_Result = document.querySelector("#Result");
  button_Result.onclick = GetDB;
  const button_AddQuest = document.querySelector("#addquest");
  button_AddQuest.onclick = AddQuest;
  const button_DeleteQuest = document.querySelector("#Daddquest");
  button_DeleteQuest.onclick = DeleteQuest;
};
