import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { UIContext } from "provider/UIProvider";
import { UserContext } from "provider/UserProvider";
import { BoardHelpers } from "helpers";
import {
  Drawer,
  Grid,
  Typography,
  Button,
  ButtonGroup,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@material-ui/core";
import { Delete, Close } from "@material-ui/icons";
import { SectionTitle, EditInput, LightButton, UserAvatar } from "components";
import { drawerStyles } from "./styles";

const BoardDrawer = ({ board, admin }) => {
  let history = useHistory();
  const classes = drawerStyles();
  const {
    drawerOpen,
    changeDrawerVisibility,
    setRenderedBoard,
    setOpenBackdrop,
  } = useContext(UIContext);
  const { userData, boards, setBoards } = useContext(UserContext);

  const [displayDescriptionEditArea, setDisplayDescriptionEditArea] =
    useState(false);
  const [displayTitleEditArea, setDisplayTitleEditArea] = useState(false);
  const [displayRemoveDialog, setDisplayRemoveDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    changeDrawerVisibility("set", false);
  };

  const closeDescriptionEditArea = () => {
    setDisplayDescriptionEditArea(false);
  };

  const closeTitleEditArea = () => {
    setDisplayTitleEditArea(false);
  };

  const closeRemoveDialog = () => {
    setDisplayRemoveDialog(false);
  };

  const editDescription = (description) => {
    setRenderedBoard({ ...board, description: description });
    BoardHelpers.HandleBoardPropertyUpdate(
      board.id,
      "description",
      description,
    ).then(() => {
      for (let i = 0; i < boards.length; i++) {
        if (boards[i].id === board.id) {
          boards[i].description = description;
          setBoards(boards);
        }
      }
    });
  };

  const editTitle = (title) => {
    const newState = { ...board, title: title };
    setRenderedBoard(newState);
    BoardHelpers.HandleBoardPropertyUpdate(board.id, "title", title).then(
      () => {
        for (let i = 0; i < boards.length; i++) {
          if (boards[i].id === board.id) {
            boards[i].title = title;
            setBoards(boards);
          }
        }
      },
    );
  };

  const removeUser = (user) => {
    const uid = user.uid;
    const users = board.users.filter((user) => user.uid !== uid);
    const filteredUserData = board.userData.filter((user) => user.uid !== uid);

    setRenderedBoard({
      ...board,
      users: users,
      userData: filteredUserData,
    });
    BoardHelpers.HandleBoardPropertyUpdate(board.id, "users", users).then(
      () => {
        for (let i = 0; i < boards.length; i++) {
          if (boards[i].id === board.id) {
            boards[i].users = users;
            boards[i].userData = filteredUserData;
            setBoards(boards);
          }
        }
      },
    );
    BoardHelpers.HandleRemovingUser(board.id, uid);
  };

  const deleteBoard = async () => {
    if (!admin) return;
    setOpenBackdrop(true);

    // deletes the board and removes board from each user
    await Promise.all([
      BoardHelpers.HandleRemovingBoard(board.id, userData.uid),
      ...board.users.map((currentUser) =>
        BoardHelpers.HandleRemovingUser(board.id, currentUser.uid),
      ),
    ]).catch((err) => console.error(err));

    const newBoards = boards.filter((current) => current.id !== board.id);
    history.push("/boards");
    setBoards(newBoards);
    setOpenBackdrop(false);
    changeDrawerVisibility("set", false);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
      classes={{ paper: classes.drawer }}
    >
      {board && (
        <Grid container justifyContent="center">
          {/* MENU - X BUTTON */}
          <Grid
            item
            container
            xs={11}
            alignItems="center"
            className={classes.gridItem}
            style={{ borderBottom: "1px solid #E0E0E0", marginTop: "8px" }}
          >
            <Grid item xs>
              <Typography
                variant="subtitle1"
                component="p"
                className={classes.menuTitle}
              >
                Menu
              </Typography>
            </Grid>
            <Grid item xs={2} container justifyContent="flex-end">
              <IconButton
                className={classes.closeButton}
                onClick={() => changeDrawerVisibility("set", false)}
              >
                <Close />
              </IconButton>
            </Grid>
          </Grid>
          {/* MADE BY - AVATAR */}
          <Grid item container xs={11} className={classes.gridItem}>
            <Grid item xs>
              <SectionTitle
                title="Made by"
                icon="account"
                alignItems="baseline"
              />
            </Grid>
            {board.admin && (
              <Grid item container xs={12} style={{ marginTop: "14px" }}>
                <Grid item style={{ width: "45px" }}>
                  <UserAvatar user={board.admin} styles={classes.avatar} />
                </Grid>
                <Grid item container xs>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      component="p"
                      className={classes.memberName}
                    >
                      {board.admin.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      component="p"
                      className={classes.date}
                    >
                      on {board.date}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
          {/* TITLE - EDIT BUTTON */}
          <Grid
            item
            container
            xs={11}
            className={classes.gridItem}
            alignItems="center"
            style={{ marginTop: "8px" }}
          >
            <Grid item xs style={{ width: "120px", maxWidth: "120px" }}>
              <Grid item xs style={{ width: "120px", maxWidth: "120px" }}>
                <SectionTitle
                  title="Title"
                  icon="description"
                  alignItems="flex-end"
                />
              </Grid>
            </Grid>
            <Grid
              item
              xs
              container
              justifyContent="flex-start"
              style={{ display: admin ? "flex" : "none" }}
            >
              <LightButton
                handleClick={() =>
                  setDisplayTitleEditArea(!displayTitleEditArea)
                }
                icon="edit"
                text="Edit"
              />
            </Grid>
          </Grid>
          {/* EDIT TITLE */}
          <Grid
            style={{
              display: displayTitleEditArea ? "flex" : "none",
              marginBottom: "24px",
            }}
            item
            container
            xs={11}
          >
            <EditInput
              value={board.title || ""}
              editInput={editTitle}
              handleClose={closeTitleEditArea}
              label="Title"
            />
          </Grid>
          {/* TITLE ITSELF */}
          <Grid
            style={{
              display: displayTitleEditArea ? "none" : "flex",
              marginBottom: "12px",
            }}
            item
            container
            xs={11}
          >
            <Typography variant="body1" className={classes.menuTitle}>
              {board.title || ""}
            </Typography>
          </Grid>
          {/* DESCRIPTION - EDIT BUTTON */}
          <Grid
            item
            container
            xs={11}
            className={classes.gridItem}
            alignItems="center"
            style={{ marginTop: "8px" }}
          >
            <Grid item xs style={{ width: "120px", maxWidth: "120px" }}>
              <SectionTitle
                title="Description"
                icon="description"
                alignItems="flex-end"
              />
            </Grid>
            <Grid item xs={2} style={{ display: admin ? "block" : "none" }}>
              <LightButton
                handleClick={() =>
                  setDisplayDescriptionEditArea(!displayDescriptionEditArea)
                }
                icon="edit"
                text="Edit"
              />
            </Grid>
          </Grid>
          {/* EDIT DESCRIPTION */}
          <Grid
            style={{
              display: displayDescriptionEditArea ? "flex" : "none",
              marginBottom: "24px",
            }}
            item
            container
            xs={11}
          >
            <EditInput
              value={board.description || ""}
              editInput={editDescription}
              handleClose={closeDescriptionEditArea}
              label="Description"
            />
          </Grid>
          {/* DESCRIPTION ITSELF */}
          <Grid
            style={{
              display: displayDescriptionEditArea ? "none" : "flex",
              marginBottom: "12px",
            }}
            item
            container
            xs={11}
          >
            <Typography variant="body1" className={classes.description}>
              {board.description || ""}
            </Typography>
          </Grid>
          {/* TEAM */}
          <Grid
            item
            container
            xs={11}
            className={classes.gridItem}
            alignItems="center"
          >
            <Grid item xs>
              <SectionTitle title="Team" icon="people" alignItems="flex-end" />
            </Grid>
          </Grid>
          {/* MAPPING TEAM MEMBERS */}
          {board.userData &&
            board.users &&
            board.userData.map((user, index) => {
              if (board.admin.uid === user.uid) {
                return (
                  <Grid
                    item
                    container
                    xs={11}
                    className={classes.gridItem}
                    alignItems="center"
                    key={user.uid}
                  >
                    <Grid item style={{ width: "50px" }}>
                      <UserAvatar user={user} styles={classes.avatar} />
                    </Grid>
                    <Grid item container xs={7}>
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle1"
                          component="p"
                          className={classes.memberName}
                        >
                          {user.name}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item container xs>
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle1"
                          component="p"
                          className={classes.adminText}
                        >
                          Admin
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                );
              } else {
                return (
                  <Grid
                    item
                    container
                    xs={11}
                    className={classes.gridItem}
                    alignItems="center"
                    key={user.uid}
                  >
                    <Grid item style={{ width: "50px" }}>
                      <UserAvatar user={user} styles={classes.avatar} />
                    </Grid>
                    <Grid item container xs={7}>
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle1"
                          component="p"
                          className={classes.memberName}
                        >
                          {user.name}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item container xs justifyContent="center">
                      <Grid item container xs={9}>
                        <div
                          onClick={() => setDisplayRemoveDialog(true)}
                          className={classes.redButton}
                          style={{ display: admin ? "flex" : "none" }}
                        >
                          <Typography
                            variant="subtitle1"
                            component="p"
                            className={classes.redButtonText}
                            style={{ textAlign: "center" }}
                          >
                            Remove
                          </Typography>
                        </div>
                      </Grid>
                      <Dialog
                        open={displayRemoveDialog}
                        onClose={closeRemoveDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                      >
                        <DialogTitle>{"Remove this user?"}</DialogTitle>
                        <DialogActions>
                          <Button onClick={closeRemoveDialog} color="primary">
                            Go Back
                          </Button>
                          <Button
                            onClick={() => {
                              removeUser(user);
                              closeRemoveDialog();
                            }}
                            style={{ color: "#f44336" }}
                          >
                            Delete
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </Grid>
                  </Grid>
                );
              }
            })}
          {/* DELETE BOARD */}
          {admin ? (
            confirmDelete ? (
              <Grid>
                <Typography variant="subtitle1" component="p">
                  Are you sure?
                </Typography>
                <ButtonGroup>
                  <Button
                    onClick={deleteBoard}
                    className={classes.deleteButton}
                    variant="contained"
                    color="secondary"
                  >
                    Yes
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ margin: "10px 0" }}
                    onClick={() => setConfirmDelete(false)}
                  >
                    No
                  </Button>
                </ButtonGroup>
              </Grid>
            ) : (
              <Button
                variant="contained"
                className={classes.deleteButton}
                startIcon={<Delete />}
                onClick={() => setConfirmDelete(true)}
              >
                Delete Board
              </Button>
            )
          ) : null}
        </Grid>
      )}
    </Drawer>
  );
};

export default BoardDrawer;
