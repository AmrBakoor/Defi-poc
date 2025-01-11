import React, { FC, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { navigations } from "./navigation.data";
import { Link } from "@mui/material";
import { useLocation } from "react-router-dom";
import { ethers } from "ethers";

type NavigationData = {
  path: string;
  label: string;
};

const Navigation: FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { ethereum } = window as any;

  const [isMetamaskInstalled, setIsMetamaskInstalled] =
    useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [defaultAccount, setDefaultAccount] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<string | null>(null);

  useEffect(() => {
    if (ethereum) {
      setIsMetamaskInstalled(true);
    }
  }, []);

  const connectWallet = async () => {
    if (isMetamaskInstalled) {
      try {
        ethereum
          .request({ method: "eth_requestAccounts" })
          .then((result: any[]) => {
            accountChangedHandler(result[0]);
            getAccountBalance(result[0]);
          });
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    } else {
      console.log("Need to install MetaMask");
      setErrorMessage("Please install MetaMask browser extension to interact");
    }
  };

  // update account, will cause component re-render
  const accountChangedHandler = (newAccount: any) => {
    setDefaultAccount(newAccount);
    getAccountBalance(newAccount.toString());
  };

  const getAccountBalance = (account: any) => {
    ethereum
      .request({ method: "eth_getBalance", params: [account, "latest"] })
      .then((balance: any) => {
        setUserBalance(ethers.utils.formatEther(balance));
      })
      .catch((error: any) => {
        setErrorMessage(error.message);
      });
  };

  // listen for chain changes
  const chainChangedHandler = () => {
    window.location.reload();
  };

  // listen for account changes
  ethereum.on("accountsChanged", accountChangedHandler);

  ethereum.on("chainChanged", chainChangedHandler);

  return (
    <Box
      sx={{
        display: "flex",
        flexFlow: "wrap",
        justifyContent: "end",
        flexDirection: { xs: "column", lg: "row" },
      }}
    >
      {navigations.map(({ path: destination, label }: NavigationData) => (
        <Box
          key={label}
          component={Link}
          href={destination}
          sx={{
            display: "inline-flex",
            position: "relative",
            color: currentPath === destination ? "" : "white",
            lineHeight: "30px",
            letterSpacing: "3px",
            cursor: "pointer",
            textDecoration: "none",
            textTransform: "uppercase",
            fontWeight: 700,
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 0, lg: 3 },
            mb: { xs: 3, lg: 0 },
            fontSize: "20px",
            ...(destination === "/" && { color: "primary.main" }),
            "& > div": { display: "none" },
            "&.current>div": { display: "block" },
            "&:hover": {
              color: "text.disabled",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 12,
              transform: "rotate(3deg)",
              "& img": { width: 44, height: "auto" },
            }}
          >
            {/* eslint-disable-next-line */}
            <img src="/images/headline-curve.svg" alt="Headline curve" />
          </Box>
          {label}
        </Box>
      ))}
      <Box
        onClick={connectWallet}
        sx={{
          position: "relative",
          color: "white",
          cursor: "pointer",
          textDecoration: "none",
          textTransform: "uppercase",
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 0, lg: 3 },
          mb: { xs: 3, lg: 0 },
          fontSize: "24px",
          lineHeight: "6px",
          width: "350px",
          height: "45px",
          borderRadius: "6px",
          backgroundColor: "#00dbe3",
        }}
      >
        {defaultAccount
          ? `Connected: $ (${userBalance} ETH)`
          : "Connect Wallet"}
      </Box>
    </Box>
  );
};

export default Navigation;
