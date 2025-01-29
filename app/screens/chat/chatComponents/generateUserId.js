const generateUserId = (currUser, storedId) => {
  const sortedIds = [currUser, storedId].sort();
  const chatID = `${sortedIds[0]}&${sortedIds[1]}`;

  const routeData = {
    chatID: chatID,
  };

  return routeData;
};

export default generateUserId;
