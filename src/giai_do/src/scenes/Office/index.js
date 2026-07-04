import React from "react";
import "./style.css";

function Office(props) {
  function alertLocked(event) {
    event.preventDefault();
    window.alert("Uh oh! The desk is locked! Try to find the key.");
  }

  return (
    <div
      className="page"
      style={{
        position: "relative",
      }}
    >
      <button
        type="button"
        className="desk room-hotspot"
        style={{
          position: "absolute",
          bottom: "150px",
          right: "-12px",
        }}
        onClick={props.puzzle[1].isSolved ? () => props.navigate("desk") : alertLocked}
        aria-label="Desk"
      />
      <button
        type="button"
        className={`${props.puzzle[2].isSolved ? "safeImg" : "painting"} room-hotspot`}
        style={{
          position: "absolute",
          right: "70px",
          bottom: "565px",
        }}
        onClick={() => props.navigate(props.puzzle[2].isSolved ? "safe" : "painting")}
        aria-label={props.puzzle[2].isSolved ? "Safe" : "Painting"}
      />
      <div
        className="painting2"
        style={{
          position: "absolute",
          right: "215px",
          bottom: "680px",
        }}
      />
      <div
        className="painting3"
        style={{
          position: "absolute",
          right: "253px",
          bottom: "523px",
        }}
      />
      <div
        className="clock"
        style={{
          position: "absolute",
          right: "493px",
          bottom: "650px",
        }}
      />
      <div
        className="lamp"
        style={{
          position: "absolute",
          right: "384px",
          bottom: "187px",
        }}
      />
      <div
        className="chair"
        style={{
          position: "absolute",
          right: "520px",
          bottom: "158px",
        }}
      />
      <div
        className="rug"
        style={{
          position: "absolute",
          right: "292px",
          bottom: "16px",
        }}
      />
      <button
        type="button"
        className="bookshelf room-hotspot"
        style={{
          position: "absolute",
          bottom: "177px",
        }}
        onClick={() => props.navigate("bookshelf")}
        aria-label="Bookshelf"
      />
    </div>
  );
}

export default Office;
