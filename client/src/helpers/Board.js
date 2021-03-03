import {
  GetUserRelatedBoards,
  CreateNewTask,
  CreateNewList,
} from "functions/BoardFunctions";
import { UIHelpers, UserHelpers } from "helpers/";

const parseBoardId = (
  boards // structuring boardIds for api call --> ["id1", "id2"]
) =>
  new Promise((resolve, reject) => {
    let body = [];
    try {
      for (let i = 0; i < boards.length; i++) {
        if (boards[i].boardId !== undefined) {
          body.push(boards[i].boardId);
        }
        if (i === boards.length - 1) {
          resolve(body);
        }
      }
    } catch (err) {
      reject(err);
    }
  });

const HandleUserRelatedBoards = (
  // fetching user related boards and seting them to context
  userData,
  setBoards,
  setOpenBackdrop
) =>
  new Promise((resolve, reject) => {
    if (
      userData !== undefined &&
      userData.boards !== undefined &&
      Object.keys(userData.boards).length > 0
    ) {
      UIHelpers.HandleBackdropOpen(setOpenBackdrop);
      parseBoardId(Object.values(userData.boards))
        .then((response) => {
          const body = {
            boardList: response,
          };
          GetUserRelatedBoards(body)
            .then((response) => {
              if (response.statusCode === 200) {
                setBoards(response.boardData);
                UIHelpers.HandleBackdropClose(setOpenBackdrop);
                resolve(true);
              }
            })
            .catch((err) => {
              UIHelpers.HandleBackdropClose(setOpenBackdrop);
              reject(err);
            });
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    } else {
      reject("userData or boards are undefined");
    }
  });

const FindExactBoard = (id, boards, setRenderedBoard, setShowAllBoards) => {
  for (let board of boards) {
    if (board.id === id) {
      UIHelpers.HandleBoardPageRender(
        board,
        setRenderedBoard,
        setShowAllBoards
      );
      console.log(board);
      break;
    }
  }
};

const HandleBoardCreation = (
  response,
  userData,
  setUserData,
  setBoards,
  setOpenBackdrop
) =>
  new Promise(async (resolve, reject) => {
    try {
      let updateUser = { ...userData };
      if (updateUser.boards !== undefined && updateUser.boards !== null) {
        Object.assign(updateUser.boards, response);
        setUserData(updateUser);
        const data = await UserHelpers.HandleUserData(
          userData.uid,
          setUserData,
          setBoards,
          setOpenBackdrop
        );
        resolve(data);
      } else {
        updateUser.boards = response;
        setUserData(updateUser);
        const data = await UserHelpers.HandleUserData(
          userData.uid,
          setUserData,
          setBoards,
          setOpenBackdrop
        );
        resolve(data);
      }
    } catch (err) {
      reject(err);
    }
  });

const HandleListCreation = (boards, boardId, lists, list, listOrder) =>
  new Promise((resolve, reject) => {
    if (boards && boardId) {
      for (let i = 0; i < boards.length; i++) {
        let board = boards[i];
        if (board.id === boardId) {
          board.lists = lists;
          board.listOrder = listOrder;
          CreateNewList({
            boardId: boardId,
            list: list,
            listOrder: listOrder,
          });
          resolve(boards);
        }
      }
    } else {
      reject("Boards or boardId is empty!");
    }
  });

const HandleTaskCreation = (boards, boardId, listId, tasks, task, taskIds) =>
  new Promise((resolve, reject) => {
    if (boards && boardId) {
      for (let i = 0; i < boards.length; i++) {
        let board = boards[i];
        if (board.id === boardId) {
          board.tasks = tasks;
          CreateNewTask({
            boardId: boardId,
            task: task,
            listId: listId,
            taskIds: taskIds,
          });
          resolve(boards);
        }
      }
    } else {
      reject("Boards or boardId is empty!");
    }
  });

const BoardHelpers = {
  HandleUserRelatedBoards: HandleUserRelatedBoards,
  HandleBoardCreation: HandleBoardCreation,
  HandleListCreation: HandleListCreation,
  HandleTaskCreation: HandleTaskCreation,
  FindExactBoard: FindExactBoard,
};

export default BoardHelpers;
